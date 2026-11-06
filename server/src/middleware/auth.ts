import { createMiddleware } from 'hono/factory';
import { jwtVerify } from 'jose';
import type { AppEnv } from '../env';

export const verifyToken = async (token: string, secret: string) => {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ['HS256'] });
    return payload as { sub: string; role?: string };
};

export const authenticate = createMiddleware<AppEnv>(async (c, next) => {
    const auth = c.req.header('Authorization');
    if (!auth?.startsWith('Bearer ')) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
        const payload = await verifyToken(auth.slice(7), c.env.JWT_SECRET);
        c.set('userId', payload.sub);
        c.set('userRole', payload.role);
    } catch {
        return c.json({ error: 'Unauthorized' }, 401);
    }
    await next();
});

export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
    if (!c.get('userId')) return c.json({ error: 'Unauthorized' }, 401);
    if (c.get('userRole') !== 'admin') return c.json({ error: 'Forbidden' }, 403);
    await next();
});
