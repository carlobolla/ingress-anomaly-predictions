import { Router, Response } from 'express';
import supabase from '../db/supabase';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();
const DEFAULT_LIMIT = 20;

const parseParam = (raw: unknown, defaultVal: number): number => {
    const n = parseInt(raw as string, 10);
    return Number.isFinite(n) && n >= 0 ? n : defaultVal;
};

// GET /leaderboard?offset=0&limit=20 — authenticated, get leaderboard from leaderboard_global view
router.get('/', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const offset = parseParam(req.query.offset, 0);
        const limit  = parseParam(req.query.limit, DEFAULT_LIMIT);

        const { data, error, count } = await supabase
            .from('leaderboard_global')
            .select('*', { count: 'exact' })
            .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);
        return res.json({ leaderboard: data, offset, limit, total: count });
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

// GET /leaderboard/:series/position — get a user's rank in a series leaderboard
router.get('/:series/position', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    const { series } = req.params;
    const user = req.userId;

    try {
        const { data: entry, error: entryError } = await supabase
            .from('leaderboard_by_series')
            .select('*')
            .eq('series', series)
            .eq('user', user)
            .single();

        if (entryError || !entry) return res.status(404).json({ error: 'User not found in leaderboard for this series' });

        const { count, error: countError } = await supabase
            .from('leaderboard_by_series')
            .select('*', { count: 'exact', head: true })
            .eq('series', series)
            .gt('score', entry.score);

        if (countError) throw new Error(countError.message);

        return res.json({ position: (count ?? 0) + 1, entry });
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

// GET /leaderboard/:series?offset=0&limit=20 — get leaderboard from a series from leaderboard_by_series view
router.get('/:series', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    const { series } = req.params;
    if (!series) return res.status(400).json({ error: 'Missing route param: series' });
    try {
        const offset = parseParam(req.query.offset, 0);
        const limit  = parseParam(req.query.limit, DEFAULT_LIMIT);

        const { data, error, count } = await supabase
            .from('leaderboard_by_series')
            .select('*', { count: 'exact' })
            .eq('series', series)
            .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);
        return res.json({ leaderboard: data, offset, limit, total: count });
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

export default router;