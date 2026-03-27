import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
export interface AuthenticatedRequest extends Request {
    userId?: string;
    userRole?: string;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as { sub: string; role?: string };
        req.userId = payload.sub;
        req.userRole = payload.role;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    if (req.userRole !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
};
