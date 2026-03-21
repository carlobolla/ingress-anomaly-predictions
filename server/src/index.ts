import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import eventsRouter from './routes/events';
import seriesRouter from './routes/series';
import authRouter from './routes/auth';
import predictionsRouter from './routes/predictions';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: ['https://ap-dev.crlb.dev', 'https://anomalypredictions.crlb.dev'], credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use('/events', eventsRouter);
app.use('/series', seriesRouter);
app.use('/auth', authRouter);
app.use('/predictions', predictionsRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
