const decodePayload = (token: string): Record<string, unknown> | null => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
};

export const isTokenExpired = (token: string): boolean => {
    const payload = decodePayload(token);
    return !payload || (payload.exp as number) * 1000 < Date.now();
};

export const getTokenRole = (token: string): string | null => {
    const payload = decodePayload(token);
    return (payload?.role as string) ?? null;
};