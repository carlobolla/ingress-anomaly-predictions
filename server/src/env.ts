import { Hono } from 'hono';

export type Bindings = {
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    TELEGRAM_BOT_TOKEN: string;
    JWT_SECRET: string;
};

export type Variables = {
    userId: string;
    userRole?: string;
};

export type AppEnv = { Bindings: Bindings; Variables: Variables };

// Non-strict so "/events" and "/events/" both match, as they did under Express
export const createRouter = () => new Hono<AppEnv>({ strict: false });
