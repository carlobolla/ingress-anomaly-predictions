import { Router, Request, Response } from 'express';
import supabase from '../db/supabase';
import Event from '../types/event';

const router = Router();

// GET /events
router.get('/', async (_req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('event')
        .select('*')
        .order('start_time', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
});

// GET /events/series/:series
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

// POST /events
router.post('/', async (req: Request, res: Response) => {
    const body: Partial<Event> = req.body;

    const { data, error } = await supabase
        .from('event')
        .insert(body)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
});

// PUT /events/:id
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const body: Partial<Event> = req.body;

    const { data, error } = await supabase
        .from('event')
        .update(body)
        .eq('id', id)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
});

// DELETE /events/:id
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('event')
        .delete()
        .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(204).send();
});

export default router;
