import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import supabase from '../db/supabase';

const router = Router();

const jwks = jwksClient({
    jwksUri: 'https://oauth.telegram.org/.well-known/jwks.json',
    cache: true,
    cacheMaxAge: 60 * 60 * 1000, // 1 hour
});

function getSigningKey(kid: string): Promise<string> {
    return new Promise((resolve, reject) => {
        jwks.getSigningKey(kid, (err, key) => {
            if (err) return reject(err);
            resolve(key!.getPublicKey());
        });
    });
}

interface TelegramOidcPayload {
    sub: string;
    id: string;
    name: string;
    preferred_username?: string;
    picture?: string;
}

// POST /auth/telegram
// Body: { response: { id_token: string, user: object } }
router.post('/telegram', async (req: Request, res: Response) => {
    const { id_token } = req.body.response ?? {};

    if (!id_token) {
        return res.status(400).json({ error: 'Missing id_token' });
    }

    const decoded = jwt.decode(id_token, { complete: true });
    if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
        return res.status(401).json({ error: 'Invalid id_token format' });
    }

    try {
        const publicKey = await getSigningKey(decoded.header.kid);

        const botId = process.env.TELEGRAM_BOT_TOKEN!.split(':')[0];

        const payload = jwt.verify(id_token, publicKey, {
            algorithms: ['RS256'],
            issuer: 'https://oauth.telegram.org',
            audience: botId,
        }) as TelegramOidcPayload;

        const [first_name, ...rest] = payload.name.split(' ');
        const last_name = rest.join(' ') || null;

        const { data: user, error } = await supabase
            .from('user')
            .upsert(
                {
                    telegram_id: Number(payload.id),
                    first_name,
                    last_name,
                    username: payload.preferred_username ?? null,
                    photo_url: payload.picture ?? null,
                },
                { onConflict: 'telegram_id' }
            )
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });

        const token = jwt.sign(
            { sub: user.id, telegram_id: Number(payload.id), role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '48h' }
        );

        return res.json({ token, user });
    } catch {
        return res.status(401).json({ error: 'Invalid or expired id_token' });
    }
});

// GET /auth/me  (requires Authorization: Bearer <token>)
router.get('/me', async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing token' });
    }

    try {
        const payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET!) as { sub: string };

        const { data: user, error } = await supabase
            .from('user')
            .select('*')
            .eq('id', payload.sub)
            .single();

        if (error) return res.status(404).json({ error: error.message });
        return res.json(user);
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
});

export default router;
