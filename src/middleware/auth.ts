import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthUser {
  uid: string;
  email?: string;
  role: 'student' | 'admin';
  fullName?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const devUserId = req.headers['x-user-id'] as string | undefined;

  let uid: string | undefined;
  let email: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      uid = decodedToken.uid;
      email = decodedToken.email;
    } catch {
      // In dev or demo mode, if token is demo uid
      if (token.startsWith('student-') || token.startsWith('admin-')) {
        uid = token;
      }
    }
  } else if (devUserId) {
    uid = devUserId;
  }

  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authentication token' });
  }

  try {
    const userRecords = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    if (userRecords.length > 0) {
      const user = userRecords[0];
      req.user = {
        uid: user.uid,
        email: user.email,
        role: user.role as 'student' | 'admin',
        fullName: user.fullName,
      };
      return next();
    }

    // If user record doesn't exist yet, allow fallback for sync/registration
    req.user = {
      uid,
      email: email || `${uid}@campusvoice.edu`,
      role: uid.includes('admin') ? 'admin' : 'student',
      fullName: 'Campus User',
    };
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(500).json({ error: 'Internal server error verifying authentication' });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  await requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  });
};
