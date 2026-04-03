import { Router, Request, Response } from 'express';
import supabase from '../db/supabase';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// PATCH /users/me  (requires Authorization: Bearer <token>)
// Body: { faction?: 'ENL' | 'RES', hide_picture?: boolean }
router.patch('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    const { faction, hide_picture } = req.body;

    if (faction !== undefined && faction !== 'ENL' && faction !== 'RES') {
        return res.status(400).json({ error: 'faction must be ENL or RES' });
    }
    if (hide_picture !== undefined && typeof hide_picture !== 'boolean') {
        return res.status(400).json({ error: 'hide_picture must be a boolean' });
    }

    const updates: Record<string, unknown> = { edited_at: new Date().toISOString() };
    if (faction !== undefined) updates.faction = faction;
    if (hide_picture !== undefined) updates.hide_picture = hide_picture;

    const { data: user, error } = await supabase
        .from('user')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(user);
});

export default router;
