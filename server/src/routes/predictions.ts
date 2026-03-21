import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import supabase from '../db/supabase';
import { PredictionInput } from '../types/prediction';

const router = Router();

function getUserId(req: Request): string | null {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return null;
    try {
        const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as { sub: string };
        return payload.sub;
    } catch {
        return null;
    }
}

// GET /predictions?series=1 — get authenticated user's predictions for a series
router.get('/', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { series } = req.query;
    if (!series) return res.status(400).json({ error: 'Missing query param: series' });

    const { data, error } = await supabase
        .from('prediction')
        .select('*, event!inner(id, series)')
        .eq('event.series', series)
        .eq('user', userId);

    if (error) return res.status(500).json({ error: error.message });
    const normalized = data.map(p => ({ ...p, event: (p.event as { id: number }).id }));
    return res.json(normalized);
});

// GET /predictions/all?series=1 — get all users' predictions for a series
router.get('/all', async (req: Request, res: Response) => {
    const { series } = req.query;
    if (!series) return res.status(400).json({ error: 'Missing query param: series' });

    const { data, error } = await supabase
        .from('prediction')
        .select('*, event!inner(id, series)')
        .eq('event.series', series);

    if (error) return res.status(500).json({ error: error.message });
    const normalized = data.map(p => ({ ...p, event: (p.event as { id: number }).id }));
    return res.json(normalized);
});

// POST /predictions?series=1 — upsert predictions for events in a series
// Body: array of { event, winner, enl_score, res_score }
router.post('/', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { series } = req.query;
    if (!series) return res.status(400).json({ error: 'Missing query param: series' });

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

// PUT /predictions?id=1 — update own prediction
router.put('/', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing query param: id' });

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

// DELETE /predictions?id=1 — delete own prediction
router.delete('/', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing query param: id' });

    const { error } = await supabase
        .from('prediction')
        .delete()
        .eq('id', id)
        .eq('user', userId);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(204).send();
});

export default router;
