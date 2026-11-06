import { cors } from 'hono/cors';
import { createRouter } from './env';
import eventsRouter from './routes/events';
import seriesRouter from './routes/series';
import authRouter from './routes/auth';
import predictionsRouter from './routes/predictions';
import usersRouter from './routes/users';
import leaderboardRouter from './routes/leaderboard';
import adminRouter from './routes/admin';

const app = createRouter();

app.use('*', cors({
    origin: ['https://ap-dev.crlb.dev', 'https://anomalypredictions.crlb.dev'],
    credentials: true,
}));

app.get('/health', (c) => c.json({ status: 'ok' }));

app.route('/events', eventsRouter);
app.route('/series', seriesRouter);
app.route('/auth', authRouter);
app.route('/predictions', predictionsRouter);
app.route('/users', usersRouter);
app.route('/leaderboard', leaderboardRouter);
app.route('/admin', adminRouter);

app.onError((err, c) => {
    console.error(err);
    return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
