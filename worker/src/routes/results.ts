import { Hono } from 'hono';
import type { Bindings } from '../index';
import { clerkAuth } from '../lib/auth';
import { getDb } from '../lib/db';
import { normalizeCity, getVoteDateET, getNextMidnightET } from '../lib/city';

type ResultsEnv = { Bindings: Bindings; Variables: { userId: string } };

export const resultsRoute = new Hono<ResultsEnv>();

resultsRoute.get('/results/:city', clerkAuth, async (c) => {
  const userId = c.get('userId');
  const cityParam = decodeURIComponent(c.req.param('city'));
  const cityNormalized = normalizeCity(cityParam);
  const voteDate = getVoteDateET();
  const sql = getDb(c.env.DATABASE_URL);

  // Get aggregate counts and user's vote in parallel
  const [counts, userVoteRows] = await Promise.all([
    sql`
      SELECT
        COUNT(*) FILTER (WHERE vote = true)::int AS yes_count,
        COUNT(*) FILTER (WHERE vote = false)::int AS no_count,
        COUNT(*)::int AS total_votes
      FROM votes
      WHERE city_normalized = ${cityNormalized} AND vote_date = ${voteDate}
    `,
    sql`
      SELECT vote FROM votes
      WHERE user_id = ${userId} AND city_normalized = ${cityNormalized} AND vote_date = ${voteDate}
      LIMIT 1
    `,
  ]);

  const { yes_count, no_count, total_votes } = counts[0];
  const userVoted = userVoteRows.length > 0;
  const userVote = userVoted ? userVoteRows[0].vote : null;

  const yesPercent = total_votes > 0 ? Math.round((yes_count / total_votes) * 100) : 0;
  const noPercent = total_votes > 0 ? 100 - yesPercent : 0;

  return c.json({
    city: cityParam,
    vote_date: voteDate,
    yes_count,
    no_count,
    total_votes,
    yes_percent: yesPercent,
    no_percent: noPercent,
    user_voted: userVoted,
    user_vote: userVote,
    resets_at: getNextMidnightET(),
  });
});
