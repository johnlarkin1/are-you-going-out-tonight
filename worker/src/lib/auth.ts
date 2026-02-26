import { createMiddleware } from 'hono/factory';
import type { Bindings } from '../index';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type AuthEnv = { Bindings: Bindings; Variables: { userId: string } };

export const deviceAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const deviceId = c.req.header('X-Device-ID');
  if (!deviceId || !UUID_RE.test(deviceId)) {
    return c.json({ error: 'Missing or invalid device ID', code: 'UNAUTHORIZED' }, 401);
  }

  c.set('userId', deviceId);
  await next();
});
