import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import supabase from '../db/supabase';

const router = Router();

function getUserId(req: Request): string | null {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return null;
    try {
        const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as { sub: string };
        return payload.sub;
    } catch {
        return null;
    }
}

// PATCH /users/me/faction  (requires Authorization: Bearer <token>)
// Body: { faction: 'ENL' | 'RES' }
router.patch('/me/faction', async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { faction } = req.body;
    if (faction !== 'ENL' && faction !== 'RES') {
        return res.status(400).json({ error: 'faction must be ENL or RES' });
    }

    const { data: user, error } = await supabase
        .from('user')
        .update({ faction, edited_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(user);
});

export default router;
