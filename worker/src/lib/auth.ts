import { createMiddleware } from 'hono/factory';
import { verifyToken } from '@clerk/backend';
import type { Bindings } from '../index';

type AuthEnv = { Bindings: Bindings; Variables: { userId: string } };

export const clerkAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Missing authorization', code: 'UNAUTHORIZED' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token, {
      secretKey: c.env.CLERK_SECRET_KEY,
    });
    c.set('userId', payload.sub);
    await next();
  } catch {
    return c.json({ error: 'Invalid token', code: 'UNAUTHORIZED' }, 401);
  }
});
