import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { healthRoute } from './routes/health';
import { voteRoute } from './routes/vote';
import { resultsRoute } from './routes/results';

export type Bindings = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/api/*', cors());
app.route('/api', healthRoute);
app.route('/api', voteRoute);
app.route('/api', resultsRoute);

export default app;
