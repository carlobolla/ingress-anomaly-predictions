import { Router, Request, Response } from 'express';
import supabase from '../db/supabase';

const router = Router();

// GET /events - get all events, ordered by start_time desc
router.get('/', async (_req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('event')
        .select('*')
        .order('start_time', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
});

// GET /events/series/:series - get events for a series, ordered by start_time asc
router.get('/series/:series', async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('event')
        .select('*')
        .eq('series', req.params.series)
        .order('start_time', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
});

// GET /events/:id
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('event')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return res.status(404).json({ error: error.message });
    return res.json(data);
});

export default router;
