import { Router, Request, Response } from 'express';
import supabase from '../db/supabase';
import Series from '../types/series';

const router = Router();

// GET /series
router.get('/', async (_req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('series')
        .select('*');

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
});

// GET /series/:id
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('series')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return res.status(404).json({ error: error.message });
    return res.json(data);
});

// GET /series/:id/events
router.get('/:id/events', async (req: Request, res: Response) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('event')
        .select('*')
        .eq('series_id', id)
        .order('start_time', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
});

export default router;
