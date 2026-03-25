import { Router, Request, Response } from 'express';
import supabase from '../db/supabase';
import { PredictionInput } from '../types/prediction';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /predictions/:series — get own predictions for a series
router.get('/:series', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { series } = req.params;
    if (!series) return res.status(400).json({ error: 'Missing route param: series' });

    const { data, error } = await supabase
        .from('prediction')
        .select('*, event!inner(id, series)')
        .eq('event.series', series)
        .eq('user', userId);

    if (error) return res.status(500).json({ error: error.message });
    const normalized = data.map(p => ({ ...p, event: (p.event as { id: number }).id }));
    return res.json(normalized);
});

// GET /predictions/all/:series — get all users' predictions for a series
router.get('/all/:series', async (req: Request, res: Response) => {
    const { series } = req.params;
    if (!series) return res.status(400).json({ error: 'Missing route param: series' });

    const { data, error } = await supabase
        .from('prediction')
        .select('*, event!inner(id, series)')
        .eq('event.series', series);

    if (error) return res.status(500).json({ error: error.message });
    const normalized = data.map(p => ({ ...p, event: (p.event as { id: number }).id }));
    return res.json(normalized);
});

// POST /predictions/:id — upsert predictions for events in a series
// Body: array of { event, winner, enl_score, res_score }
router.post('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { series } = req.params;
    if (!series) return res.status(400).json({ error: 'Missing route param: series' });

    const inputs: (PredictionInput & { event: number })[] = req.body;
    if (!Array.isArray(inputs) || inputs.length === 0) {
        return res.status(400).json({ error: 'Body must be a non-empty array of predictions' });
    }

    // Fetch start_times for the submitted events to enforce the 24h cutoff
    const eventIds = inputs.map((p) => p.event);
    const { data: events, error: eventsError } = await supabase
        .from('event')
        .select('id, start_time')
        .in('id', eventIds);

    if (eventsError) return res.status(500).json({ error: eventsError.message });

    const cutoffMap = new Map<number, Date>(
        (events ?? []).map((e) => [e.id, new Date(e.start_time)])
    );

    const now = new Date();
    const rows = inputs
        .filter((p) => {
            const startTime = cutoffMap.get(p.event);
            if (!startTime) return false;
            return now < new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
        })
        .map((p) => ({
            event: p.event,
            user: userId,
            winner: p.winner,
            enl_score: p.enl_score,
            res_score: p.res_score,
        }));

    if (rows.length === 0) {
        return res.status(400).json({ error: 'All predictions are past the cutoff (24h before event start)' });
    }

    const { data, error } = await supabase
        .from('prediction')
        .upsert(rows, { onConflict: 'event,user' })
        .select();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
});

// PUT /predictions/:id — update own prediction
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Missing route param: id' });

    const body: Partial<PredictionInput> = req.body;

    // Fetch the event's start_time via the prediction to enforce the 24h cutoff
    const { data: existing, error: fetchError } = await supabase
        .from('prediction')
        .select('event(start_time)')
        .eq('id', id)
        .eq('user', userId)
        .single();

    if (fetchError) return res.status(404).json({ error: 'Prediction not found' });

    const startTime = new Date((existing.event as unknown as { start_time: string }).start_time);
    if (new Date() >= new Date(startTime.getTime() - 24 * 60 * 60 * 1000)) {
        return res.status(400).json({ error: 'Prediction is past the cutoff (24h before event start)' });
    }

    const { data, error } = await supabase
        .from('prediction')
        .update(body)
        .eq('id', id)
        .eq('user', userId)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
});

// DELETE /predictions/:id — delete own prediction
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Missing route param: id' });

    const { error } = await supabase
        .from('prediction')
        .delete()
        .eq('id', id)
        .eq('user', userId);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(204).send();
});

export default router;
