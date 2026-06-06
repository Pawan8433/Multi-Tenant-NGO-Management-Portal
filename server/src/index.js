import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import api from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
if (!env.isProd) app.use(morgan('dev'));

app.use('/api', api);

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`\n  ${env.appName} API running on http://localhost:${env.port}`);
  console.log(`  Environment: ${env.nodeEnv}`);
  console.log(`  CORS origin: ${env.clientUrl}\n`);
});
