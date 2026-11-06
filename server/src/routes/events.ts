import { createRouter } from '../env';
import { getSupabase } from '../db/supabase';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = createRouter();

// GET /events - get all events, ordered by start_time desc
router.get('/', async (c) => {
    const { data, error } = await getSupabase(c.env)
        .from('event')
        .select('*, eventType(prediction_cutoff)')
        .order('start_time', { ascending: false });

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data as any);
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
router.get('/series/:series', async (c) => {
    const { data, error } = await getSupabase(c.env)
        .from('event')
        .select('*, eventType(prediction_cutoff)')
        .eq('series', c.req.param('series'))
        .order('start_time', { ascending: true });

    if (error) return c.json({ error: error.message }, 500);

    const enriched = (data as any[]).map(event => {
        const cutoff = event.eventType?.prediction_cutoff;
        const cutoff_time = cutoff
            ? new Date(new Date(event.start_time).getTime() - parseIntervalMs(cutoff)).toISOString()
            : null;
        return { ...event, cutoff_time };
    });

    return c.json(enriched);
});

// GET /events/types - get all event types
router.get('/types', async (c) => {
    const { data, error } = await getSupabase(c.env)
        .from('eventType')
        .select('*')
        .order('order', { ascending: true });

    if (error) return c.json({ error: error.message }, 500);
    c.header('Cache-Control', 'public, max-age=3600');
    return c.json(data);
});

// GET /events/unscored - get events that have results but at least one prediction hasn't been scored yet (admin only)
router.get('/unscored', authenticate, requireAdmin, async (c) => {
    const supabase = getSupabase(c.env);
    const { data: unscoredPreds, error: predsError } = await supabase
        .from('prediction')
        .select('event')
        .is('score', null);

    if (predsError) return c.json({ error: predsError.message }, 500);

    const eventIds = [...new Set((unscoredPreds ?? []).map(p => p.event))];
    if (eventIds.length === 0) return c.json([]);

    const { data, error } = await supabase
        .from('event')
        .select('id, name, type, region, series, end_time, enl_score, res_score, winner')
        .in('id', eventIds)
        .or('enl_score.not.is.null,winner.not.is.null')
        .order('end_time', { ascending: true });

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data);
});

// GET /events/pending-results - get events with no result entered yet (admin only)
router.get('/pending-results', authenticate, requireAdmin, async (c) => {
    const { data, error } = await getSupabase(c.env)
        .from('event')
        .select('id, name, type, region, series, end_time, enl_score, res_score, winner')
        .is('enl_score', null)
        .is('winner', null)
        .order('end_time', { ascending: true });

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data);
});

// GET /events/notifiable - get events that can be notified to users (admin only)
router.get('/notifiable', authenticate, requireAdmin, async (c) => {
    // Single query: inner-join predictions so only events with at least one scored prediction are returned
    const { data, error } = await getSupabase(c.env)
        .from('event')
        .select('id, name, type, region, series, end_time, enl_score, res_score, winner, prediction!inner(id)')
        .not('prediction.score', 'is', null)
        .limit(1, { referencedTable: 'prediction' })
        .or('enl_score.not.is.null,winner.not.is.null')
        .eq('notified_to_users', false)
        .order('end_time', { ascending: true });

    if (error) return c.json({ error: error.message }, 500);
    return c.json((data ?? []).map(({ prediction: _prediction, ...event }) => event));
});


// PATCH /events/:id/result - admin only, sets the actual result for an event
// Body: { winner?: 'ENL' | 'RES' | null, enl_score?: number | null, res_score?: number | null }
router.patch('/:id/result', authenticate, requireAdmin, async (c) => {
    const id = c.req.param('id');
    let { winner, enl_score, res_score } = await c.req.json().catch(() => ({})) as { winner?: string | null; enl_score?: number | null; res_score?: number | null };

    if (winner != null && winner !== 'ENL' && winner !== 'RES') {
        return c.json({ error: "winner must be 'ENL', 'RES', or null" }, 400);
    }
    if (enl_score != null && (typeof enl_score !== 'number' || enl_score < 0 || enl_score > 100)) {
        return c.json({ error: 'enl_score must be a number between 0 and 100' }, 400);
    }
    if (res_score != null && (typeof res_score !== 'number' || res_score < 0 || res_score > 100)) {
        return c.json({ error: 'res_score must be a number between 0 and 100' }, 400);
    }
    if (winner == null && enl_score == null && res_score == null) {
        return c.json({ error: 'At least one of winner, enl_score, or res_score is required' }, 400);
    }

    const supabase = getSupabase(c.env);
    const { data: existing, error: existingError } = await supabase
        .from('event')
        .select('type')
        .eq('id', id)
        .single();
    if (existingError || !existing) return c.json({ error: 'Event not found' }, 404);

    // Minor (winner-only) events are always stored as 100/0 for the winning faction
    const isMinor = ![1, 2, 4].includes(existing.type);
    if (isMinor) {
        if (winner == null) return c.json({ error: 'winner is required for minor events' }, 400);
        enl_score = winner === 'ENL' ? 100 : 0;
        res_score = winner === 'ENL' ? 0 : 100;
    }

    const { data, error } = await supabase
        .from('event')
        .update({ winner: winner ?? null, enl_score: enl_score ?? null, res_score: res_score ?? null })
        .eq('id', id)
        .select()
        .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data);
});

// POST /events/:id/score - admin only, triggers update_prediction_scores RPC
router.post('/:id/score', authenticate, requireAdmin, async (c) => {
    const id = c.req.param('id');

    const { error } = await getSupabase(c.env).rpc('update_prediction_scores', { p_event_id: id });

    if (error) return c.json({ error: error.message }, 500);
    return c.json({ success: true });
});

// GET /events/:id
router.get('/:id', async (c) => {
    const id = c.req.param('id');

    const { data, error } = await getSupabase(c.env)
        .from('event')
        .select('*, eventType(prediction_cutoff)')
        .eq('id', id)
        .single();

    if (error) return c.json({ error: error.message }, 404);

    const enriched = (data as any[]).map(event => {
        const cutoff = event.eventType?.prediction_cutoff;
        const cutoff_time = cutoff
            ? new Date(new Date(event.start_time).getTime() - parseIntervalMs(cutoff)).toISOString()
            : null;
        return { ...event, cutoff_time };
    });

    return c.json(enriched);
});

export default router;
