import { createRouter } from '../env';
import { getSupabase } from '../db/supabase';
import { authenticate } from '../middleware/auth';

const router = createRouter();

// PATCH /users/me  (requires Authorization: Bearer <token>)
// Body: { faction?: 'ENL' | 'RES', hide_picture?: boolean }
router.patch('/me', authenticate, async (c) => {
    const userId = c.get('userId');
    const { faction, hide_picture, notifications } = await c.req.json().catch(() => ({}));

    if (faction !== undefined && faction !== 'ENL' && faction !== 'RES') {
        return c.json({ error: 'faction must be ENL or RES' }, 400);
    }
    if (hide_picture !== undefined && typeof hide_picture !== 'boolean') {
        return c.json({ error: 'hide_picture must be a boolean' }, 400);
    }

    const updates: Record<string, unknown> = { edited_at: new Date().toISOString() };
    if (faction !== undefined) updates.faction = faction;
    if (hide_picture !== undefined) updates.hide_picture = hide_picture;
    if (notifications !== undefined) updates.notifications = notifications;

    const { data: user, error } = await getSupabase(c.env)
        .from('user')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) return c.json({ error: error.message }, 500);
    return c.json(user);
});

export default router;
