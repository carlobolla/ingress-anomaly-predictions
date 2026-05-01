import { Router, Response } from 'express';
import supabase from '../db/supabase';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth';
import { sendTelegramMessages, notifyEventResults } from '../services/telegram';

const router = Router();

// GET /admin/users - list all users
router.get('/users', authenticate, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
    const { data, error } = await supabase
        .from('user')
        .select('id, first_name, last_name, username, telegram_id, faction, role')
        .eq('notifications', true)
        .order('username');

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
});

// POST /admin/telegram/send
// Body: { message: string, user_ids: string[] }
router.post('/telegram/send', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    const { message, user_ids } = req.body as { message: string; user_ids: string[] };

    if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'message is required' });
    }
    if (!user_ids || user_ids.length === 0) {
        return res.status(400).json({ error: 'user_ids is required' });
    }

    const query = supabase.from('user').select('id, telegram_id, username, first_name').in('id', user_ids);

    const { data: users, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    if (!users || users.length === 0) return res.status(404).json({ error: 'No users found' });

    console.log(`[telegram] sending message to ${users.length} user(s): "${message.slice(0, 80)}${message.length > 80 ? '…' : ''}"`);

    const result = await sendTelegramMessages(users.map(u => ({ ...u, message })));
    return res.json(result);
});

// POST /admin/events/:id/notify - send each user their result + prediction + score for an event
router.post('/events/:id/notify', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    const eventId = parseInt(req.params.id, 10);
    if (isNaN(eventId)) return res.status(400).json({ error: 'Invalid event ID' });

    try {
        const result = await notifyEventResults(eventId);
        return res.json(result);
    } catch (err) {
        return res.status(500).json({ error: (err as Error).message });
    }
});

export default router;
