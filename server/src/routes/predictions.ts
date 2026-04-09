import { Router, Request, Response } from 'express';
import supabase from '../db/supabase';
import { PredictionInput, Winner } from '../types/prediction';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Parse a PostgreSQL interval string (e.g. "24:00:00", "1 day", "1 day 02:00:00") to milliseconds
function intervalToMs(interval: string): number {
    let ms = 0;
    const dayMatch = interval.match(/(-?\d+)\s+days?/);
    if (dayMatch) ms += parseInt(dayMatch[1]) * 86400000;
    const timeMatch = interval.match(/(-?)(\d+):(\d+):(\d+)/);
    if (timeMatch) {
        const sign = timeMatch[1] === '-' ? -1 : 1;
        ms += sign * parseInt(timeMatch[2]) * 3600000;
        ms += sign * parseInt(timeMatch[3]) * 60000;
        ms += sign * parseInt(timeMatch[4]) * 1000;
    }
    return ms;
}

// GET /predictions/series/:series/scored — get own predictions for a series with scores and actual event results
router.get('/series/:series/scored', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { series } = req.params;
    if (!series) return res.status(400).json({ error: 'Missing route param: series' });

    const { data, error } = await supabase
        .from('prediction')
        .select('id, event!inner(id, name, series, enl_score, res_score, winner), winner, enl_score, res_score, score, edited_at, created_at')
        .eq('event.series', series)
        .eq('user', userId);

    if (error) return res.status(500).json({ error: error.message });

    const result = data.map(p => {
        const event = p.event as unknown as { id: number; name: string; series: number; enl_score: number | null; res_score: number | null; winner: string | null };
        return {
            id: p.id,
            event: event.id,
            event_name: event.name,
            predicted_winner: p.winner,
            predicted_enl_score: p.enl_score,
            predicted_res_score: p.res_score,
            score: p.score,
            actual_enl_score: event.enl_score,
            actual_res_score: event.res_score,
            actual_winner: event.winner,
            edited_at: p.edited_at,
            created_at: p.created_at,
        };
    });

    return res.json(result);
});

// GET /predictions/series/:series — get own predictions for a series
router.get('/series/:series', authenticate, async (req: AuthenticatedRequest, res: Response) => {
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

// POST /predictions/series/:series — upsert predictions for events in a series
// Body: array of { event, winner, enl_score, res_score }
router.post('/series/:series', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { series } = req.params;
    if (!series) return res.status(400).json({ error: 'Missing route param: series' });

    const inputs: (PredictionInput & { event: number })[] = req.body;
    if (!Array.isArray(inputs) || inputs.length === 0) {
        return res.status(400).json({ error: 'Body must be a non-empty array of predictions' });
    }

    // Fetch start_times and prediction_cutoff for the submitted events
    const eventIds = inputs.map((p) => p.event);
    const { data: events, error: eventsError } = await supabase
        .from('event')
        .select('id, start_time, eventType(prediction_cutoff)')
        .in('id', eventIds);

    if (eventsError) return res.status(500).json({ error: eventsError.message });

    const eventMap = new Map<number, { start_time: Date; cutoffMs: number }>(
        (events ?? []).map((e) => [e.id, {
            start_time: new Date(e.start_time),
            cutoffMs: intervalToMs((e.eventType as unknown as { prediction_cutoff: string }).prediction_cutoff),
        }])
    );

    const now = new Date();
    const rows: { event: number; user: string; winner: Winner | null; enl_score: number; res_score: number; edited_at: string }[] = [];
    const rejected: { event: number; reason: string }[] = [];

    for (const p of inputs) {
        const ev = eventMap.get(p.event);
        if (!ev) {
            rejected.push({ event: p.event, reason: 'Event not found' });
            continue;
        }
        if (now >= new Date(ev.start_time.getTime() - ev.cutoffMs)) {
            rejected.push({ event: p.event, reason: 'Past the prediction cutoff' });
            continue;
        }
        rows.push({
            event: p.event,
            user: userId,
            winner: p.winner ?? null,
            enl_score: p.enl_score,
            res_score: p.res_score,
            edited_at: new Date().toISOString(),
        });
    }

    if (rows.length === 0) {
        return res.status(400).json({ error: 'All predictions are past the cutoff', rejected });
    }

    const { data, error } = await supabase
        .from('prediction')
        .upsert(rows, { onConflict: 'event,user' })
        .select();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ saved: data, rejected });
});

// PUT /predictions/:id — update own prediction
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Missing route param: id' });

    const body: Partial<PredictionInput> & { edited_at: string } = { ...req.body, edited_at: new Date().toISOString() };

    // Fetch the event's start_time and prediction_cutoff via the prediction
    const { data: existing, error: fetchError } = await supabase
        .from('prediction')
        .select('event(start_time, eventType(prediction_cutoff))')
        .eq('id', id)
        .eq('user', userId)
        .single();

    if (fetchError) return res.status(404).json({ error: 'Prediction not found' });

    const ev = existing.event as unknown as { start_time: string; eventType: { prediction_cutoff: string } };
    const cutoffMs = intervalToMs(ev.eventType.prediction_cutoff);
    if (new Date() >= new Date(new Date(ev.start_time).getTime() - cutoffMs)) {
        return res.status(400).json({ error: 'Prediction is past the cutoff' });
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

// DELETE /predictions/series/:id — delete own prediction
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
