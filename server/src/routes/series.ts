import { createRouter } from '../env';
import { getSupabase } from '../db/supabase';

const router = createRouter();

// GET /series
router.get('/', async (c) => {
    const { data, error } = await getSupabase(c.env)
        .from('series')
        .select('*')
        .order('id', { ascending: false });

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data);
});

// GET /series/:id
router.get('/:id', async (c) => {
    const id = c.req.param('id');

    const { data, error } = await getSupabase(c.env)
        .from('series')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return c.json({ error: error.message }, 404);
    return c.json(data);
});

// GET /series/:id/events
router.get('/:id/events', async (c) => {
    const id = c.req.param('id');

    const { data, error } = await getSupabase(c.env)
        .from('event')
        .select('*')
        .eq('series_id', id)
        .order('start_time', { ascending: false });

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data);
});

export default router;
