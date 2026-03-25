import { Router, Request, Response } from 'express';
import supabase from '../db/supabase';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /leaderboard — authenticated, get leaderboard from leaderboard_global view
router.get('/', authenticate, async (_req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.from('leaderboard_global').select('*');
        if (error) throw new Error(error.message);
        return res.json({ leaderboard: data });
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

// GET /leaderboard/:series — get leaderboard from a series from leaderboard_by_series view
router.get('/:series', authenticate, async (req: Request, res: Response) => {
    const { series } = req.params;
    if (!series) return res.status(400).json({ error: 'Missing route param: series' });
    try {
        const { data, error } = await supabase.from('leaderboard_by_series').select('*').eq('series', series);
        if (error) throw new Error(error.message);
        return res.json({ leaderboard: data });
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
});

export default router;