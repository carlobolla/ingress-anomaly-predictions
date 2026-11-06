import { createRouter } from '../env';
import { getSupabase } from '../db/supabase';
import { authenticate, requireAdmin } from '../middleware/auth';
import { sendTelegramMessages, notifyEventResults } from '../services/telegram';

const router = createRouter();

// GET /admin/users - list all users
router.get('/users', authenticate, requireAdmin, async (c) => {
    const { data, error } = await getSupabase(c.env)
        .from('user')
        .select('id, first_name, last_name, username, telegram_id, faction, role')
        .eq('notifications', true)
        .order('username');

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data);
});

// POST /admin/telegram/send
// Body: { message: string, user_ids: string[] }
router.post('/telegram/send', authenticate, requireAdmin, async (c) => {
    const { message, user_ids } = await c.req.json().catch(() => ({})) as { message: string; user_ids: string[] };

    if (!message || typeof message !== 'string' || !message.trim()) {
        return c.json({ error: 'message is required' }, 400);
    }
    if (!user_ids || user_ids.length === 0) {
        return c.json({ error: 'user_ids is required' }, 400);
    }

    const { data: users, error } = await getSupabase(c.env)
        .from('user')
        .select('id, telegram_id, username, first_name')
        .in('id', user_ids);

    if (error) return c.json({ error: error.message }, 500);
    if (!users || users.length === 0) return c.json({ error: 'No users found' }, 404);

    console.log(`[telegram] sending message to ${users.length} user(s): "${message.slice(0, 80)}${message.length > 80 ? '…' : ''}"`);

    const result = await sendTelegramMessages(c.env, users.map(u => ({ ...u, message })));
    return c.json(result);
});

// POST /admin/events/:id/notify - send each user their result + prediction + score for an event
router.post('/events/:id/notify', authenticate, requireAdmin, async (c) => {
    const eventId = parseInt(c.req.param('id'), 10);
    if (isNaN(eventId)) return c.json({ error: 'Invalid event ID' }, 400);

    try {
        const result = await notifyEventResults(c.env, eventId);
        return c.json(result);
    } catch (err) {
        return c.json({ error: (err as Error).message }, 500);
    }
});

export default router;
