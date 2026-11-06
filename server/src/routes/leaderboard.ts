import { createRouter } from '../env';
import { getSupabase } from '../db/supabase';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = createRouter();
const DEFAULT_LIMIT = 20;

const parseParam = (raw: string | undefined, defaultVal: number): number => {
    const n = parseInt(raw as string, 10);
    return Number.isFinite(n) && n >= 0 ? n : defaultVal;
};

// GET /leaderboard?offset=0&limit=20 - authenticated, get leaderboard from leaderboard_global view
router.get('/', authenticate, requireAdmin, async (c) => {
    try {
        const offset = parseParam(c.req.query('offset'), 0);
        const limit  = parseParam(c.req.query('limit'), DEFAULT_LIMIT);

        const { data, error, count } = await getSupabase(c.env)
            .from('leaderboard_global')
            .select('*', { count: 'exact' })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);
        return c.json({ leaderboard: data, offset, limit, total: count });
    } catch (error) {
        return c.json({ error: (error as Error).message }, 500);
    }
});

// GET /leaderboard/:series/position - get a user's rank in a series leaderboard
router.get('/:series/position', authenticate, async (c) => {
    const series = c.req.param('series');
    const user = c.get('userId');
    const supabase = getSupabase(c.env);

    try {
        const { data: entry, error: entryError } = await supabase
            .from('leaderboard_by_series')
            .select('*')
            .eq('series', series)
            .eq('user', user)
            .single();

        if (entryError || !entry) return c.json({ error: 'User not found in leaderboard for this series' }, 404);

        const { count, error: countError } = await supabase
            .from('leaderboard_by_series')
            .select('*', { count: 'exact', head: true })
            .eq('series', series)
            .gt('score', entry.score);

        if (countError) throw new Error(countError.message);

        return c.json({ position: (count ?? 0) + 1, entry });
    } catch (error) {
        return c.json({ error: (error as Error).message }, 500);
    }
});

// GET /leaderboard/:series?offset=0&limit=20 - get leaderboard from a series from leaderboard_by_series view
router.get('/:series', authenticate, async (c) => {
    const series = c.req.param('series');
    if (!series) return c.json({ error: 'Missing route param: series' }, 400);
    try {
        const offset = parseParam(c.req.query('offset'), 0);
        const limit  = parseParam(c.req.query('limit'), DEFAULT_LIMIT);

        const { data, error, count } = await getSupabase(c.env)
            .from('leaderboard_by_series')
            .select('*', { count: 'exact' })
            .eq('series', series)
            .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);
        return c.json({ leaderboard: data, offset, limit, total: count });
    } catch (error) {
        return c.json({ error: (error as Error).message }, 500);
    }
});

export default router;
