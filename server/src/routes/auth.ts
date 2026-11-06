import { SignJWT, createRemoteJWKSet, decodeProtectedHeader, jwtVerify } from 'jose';
import { createRouter } from '../env';
import { getSupabase } from '../db/supabase';
import { verifyToken } from '../middleware/auth';

const router = createRouter();

// jose caches the fetched key set and refreshes it on an unknown kid
const jwks = createRemoteJWKSet(new URL('https://oauth.telegram.org/.well-known/jwks.json'));

interface TelegramOidcPayload {
    sub: string;
    id: string;
    name: string;
    preferred_username?: string;
    picture?: string;
}

// POST /auth/telegram
// Body: { response: { id_token: string, user: object } }
router.post('/telegram', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const { id_token } = body.response ?? {};

    if (!id_token) {
        return c.json({ error: 'Missing id_token' }, 400);
    }

    try {
        if (!decodeProtectedHeader(id_token).kid) throw new Error('missing kid');
    } catch {
        return c.json({ error: 'Invalid id_token format' }, 401);
    }

    try {
        const botId = c.env.TELEGRAM_BOT_TOKEN.split(':')[0];

        const { payload: verified } = await jwtVerify(id_token, jwks, {
            algorithms: ['RS256'],
            issuer: 'https://oauth.telegram.org',
            audience: botId,
        });
        const payload = verified as unknown as TelegramOidcPayload;

        const [first_name, ...rest] = payload.name.split(' ');
        const last_name = rest.join(' ') || null;

        const supabase = getSupabase(c.env);
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

        if (error) return c.json({ error: error.message }, 500);

        const token = await new SignJWT({ telegram_id: Number(payload.id), role: user.role })
            .setProtectedHeader({ alg: 'HS256' })
            .setSubject(user.id)
            .setIssuedAt()
            .setExpirationTime('48h')
            .sign(new TextEncoder().encode(c.env.JWT_SECRET));

        return c.json({ token, user });
    } catch {
        return c.json({ error: 'Invalid or expired id_token' }, 401);
    }
});

// GET /auth/me  (requires Authorization: Bearer <token>)
router.get('/me', async (c) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return c.json({ error: 'Missing token' }, 401);
    }

    try {
        const payload = await verifyToken(authHeader.slice(7), c.env.JWT_SECRET);

        const { data: user, error } = await getSupabase(c.env)
            .from('user')
            .select('*')
            .eq('id', payload.sub)
            .single();

        if (error) return c.json({ error: error.message }, 404);
        return c.json(user);
    } catch {
        return c.json({ error: 'Invalid token' }, 401);
    }
});

export default router;
