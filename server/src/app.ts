import express from 'express';
import sporsmalRouter from './sporsmal-router';
import svarRouter from './svar-router';
import tagRouter from './tag-router';
import sporsmalTagRouter from './sporsmalTag-router';
import favorittRouter from './favoritt-router';

/**
 * Express application.
 */
const app = express();

app.use(express.json());

// Since API is not compatible with v1, API version is increased to v2
app.use('/api/v2', sporsmalRouter);
app.use('/api/v2', svarRouter);
app.use('/api/v2', tagRouter);
app.use('/api/v2', sporsmalTagRouter);
app.use('/api/v2', favorittRouter);

export default app;
