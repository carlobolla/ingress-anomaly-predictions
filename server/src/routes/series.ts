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

// POST /series
router.post('/', async (req: Request, res: Response) => {
    const body: Partial<Series> = req.body;

    const { data, error } = await supabase
        .from('series')
        .insert(body)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
});

// PUT /series/:id
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const body: Partial<Series> = req.body;

    const { data, error } = await supabase
        .from('series')
        .update(body)
        .eq('id', id)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
});

// DELETE /series/:id
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('series')
        .delete()
        .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(204).send();
});

export default router;
