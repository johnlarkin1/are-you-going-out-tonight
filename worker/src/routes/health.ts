import { Hono } from 'hono';
import type { Bindings } from '../index';

export const healthRoute = new Hono<{ Bindings: Bindings }>();

healthRoute.get('/health', (c) => {
  return c.json({ status: 'ok' });
});
