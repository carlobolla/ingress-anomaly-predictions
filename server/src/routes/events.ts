import { Router, Request, Response } from 'express';
import supabase from '../db/supabase';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /events - get all events, ordered by start_time desc
router.get('/', async (_req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('event')
        .select('*, eventType(prediction_cutoff)')
        .order('start_time', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data as any);
});

const parseIntervalMs = (interval: string): number => {
    let ms = 0;
    const years  = interval.match(/(-?\d+)\s+years?/);
    const months = interval.match(/(-?\d+)\s+mons?/);
    const days   = interval.match(/(-?\d+)\s+days?/);
    const time   = interval.match(/(-?)(\d+):(\d+):(\d+)/);
    if (years)  ms += parseInt(years[1])  * 365 * 24 * 60 * 60 * 1000;
    if (months) ms += parseInt(months[1]) * 30  * 24 * 60 * 60 * 1000;
    if (days)   ms += parseInt(days[1])   * 24  * 60 * 60 * 1000;
    if (time) {
        const sign = time[1] === '-' ? -1 : 1;
        ms += sign * parseInt(time[2]) * 60 * 60 * 1000;
        ms += sign * parseInt(time[3]) * 60 * 1000;
        ms += sign * parseInt(time[4]) * 1000;
    }
    return ms;
};

// GET /events/series/:series - get events for a series, ordered by start_time asc
router.get('/series/:series', async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('event')
        .select('*, eventType(prediction_cutoff)')
        .eq('series', req.params.series)
        .order('start_time', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    const enriched = (data as any[]).map(event => {
        const cutoff = event.eventType?.prediction_cutoff;
        const cutoff_time = cutoff
            ? new Date(new Date(event.start_time).getTime() - parseIntervalMs(cutoff)).toISOString()
            : null;
        return { ...event, cutoff_time };
    });

    return res.json(enriched);
});

// GET /events/types - get all event types
router.get('/types', async (_req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('eventType')
        .select('*')
        .order('order', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.set('Cache-Control', 'public, max-age=3600');
    return res.json(data);
});

// GET /events/unscored - get events that have results but at least one prediction hasn't been scored yet (admin only)
router.get('/unscored', authenticate, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
    const { data: unscoredPreds, error: predsError } = await supabase
        .from('prediction')
        .select('event')
        .is('score', null);

    if (predsError) return res.status(500).json({ error: predsError.message });

    const eventIds = [...new Set((unscoredPreds ?? []).map(p => p.event))];
    if (eventIds.length === 0) return res.json([]);

    const { data, error } = await supabase
        .from('event')
        .select('id, name, type, region, series, end_time, enl_score, res_score, winner')
        .in('id', eventIds)
        .or('enl_score.not.is.null,winner.not.is.null')
        .order('end_time', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
});

// GET /events/pending-results - get events with no result entered yet (admin only)
router.get('/pending-results', authenticate, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
    const { data, error } = await supabase
        .from('event')
        .select('id, name, type, region, series, end_time, enl_score, res_score, winner')
        .is('enl_score', null)
        .is('winner', null)
        .order('end_time', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
});

// GET /events/notifiable - get events that can be notified to users (admin only)
router.get('/notifiable', authenticate, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
    const { data: scoredPreds, error: predsError } = await supabase
        .from('prediction')
        .select('event')
        .not('score', 'is', null);

    if (predsError) return res.status(500).json({ error: predsError.message });

    const eventIds = [...new Set((scoredPreds ?? []).map(p => p.event as number))];
    if (eventIds.length === 0) return res.json([]);

    const { data, error } = await supabase
        .from('event')
        .select('id, name, type, region, series, end_time, enl_score, res_score, winner')
        .in('id', eventIds)
        .or('enl_score.not.is.null,winner.not.is.null')
        .eq('notified_to_users', false)
        .order('end_time', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
});


// PATCH /events/:id/result - admin only, sets the actual result for an event
// Body: { winner?: 'ENL' | 'RES' | null, enl_score?: number | null, res_score?: number | null }
router.patch('/:id/result', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { winner, enl_score, res_score } = req.body as { winner?: string | null; enl_score?: number | null; res_score?: number | null };

    if (winner != null && winner !== 'ENL' && winner !== 'RES') {
        return res.status(400).json({ error: "winner must be 'ENL', 'RES', or null" });
    }
    if (enl_score != null && (typeof enl_score !== 'number' || enl_score < 0 || enl_score > 100)) {
        return res.status(400).json({ error: 'enl_score must be a number between 0 and 100' });
    }
    if (res_score != null && (typeof res_score !== 'number' || res_score < 0 || res_score > 100)) {
        return res.status(400).json({ error: 'res_score must be a number between 0 and 100' });
    }
    if (winner == null && enl_score == null && res_score == null) {
        return res.status(400).json({ error: 'At least one of winner, enl_score, or res_score is required' });
    }

    const { data, error } = await supabase
        .from('event')
        .update({ winner: winner ?? null, enl_score: enl_score ?? null, res_score: res_score ?? null })
        .eq('id', id)
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
});

// POST /events/:id/score - admin only, triggers update_prediction_scores RPC
router.post('/:id/score', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const { error } = await supabase.rpc('update_prediction_scores', { p_event_id: id });

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
});

// GET /events/:id
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('event')
        .select('*, eventType(prediction_cutoff)')
        .eq('id', id)
        .single();

    if (error) return res.status(404).json({ error: error.message });

    const enriched = (data as any[]).map(event => {
        const cutoff = event.eventType?.prediction_cutoff;
        const cutoff_time = cutoff
            ? new Date(new Date(event.start_time).getTime() - parseIntervalMs(cutoff)).toISOString()
            : null;
        return { ...event, cutoff_time };
    });

    return res.json(enriched);
});

export default router;
