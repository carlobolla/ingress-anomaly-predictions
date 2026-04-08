import { Router, Request, Response } from 'express';
import supabase from '../db/supabase';

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
