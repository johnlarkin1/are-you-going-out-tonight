import { Hono } from 'hono';
import type { Bindings } from '../index';
import { deviceAuth } from '../lib/auth';
import { getDb } from '../lib/db';
import { normalizeCity, getVoteDateET } from '../lib/city';

type VoteEnv = { Bindings: Bindings; Variables: { userId: string } };

export const voteRoute = new Hono<VoteEnv>();

voteRoute.post('/vote', deviceAuth, async (c) => {
  const userId = c.get('userId');

  let body: { city?: string; vote?: boolean };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON', code: 'BAD_REQUEST' }, 400);
  }

  const { city, vote } = body;

  if (typeof city !== 'string' || !city.trim()) {
    return c.json({ error: 'City is required', code: 'BAD_REQUEST' }, 400);
  }
  if (typeof vote !== 'boolean') {
    return c.json({ error: 'Vote must be a boolean', code: 'BAD_REQUEST' }, 400);
  }

  const cityNormalized = normalizeCity(city);
  const voteDate = getVoteDateET();
  const sql = getDb(c.env.DATABASE_URL);

  const rows = await sql`
    INSERT INTO votes (user_id, city_raw, city_normalized, vote, vote_date)
    VALUES (${userId}, ${city.trim()}, ${cityNormalized}, ${vote}, ${voteDate})
    ON CONFLICT (user_id, city_normalized, vote_date) DO NOTHING
    RETURNING id
  `;

  if (rows.length === 0) {
    return c.json({ error: 'Already voted today', code: 'ALREADY_VOTED' }, 409);
  }

  return c.json({ success: true, id: rows[0].id }, 201);
});
