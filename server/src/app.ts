import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config.js';
import { gatewayRouter } from './routes/gateway.js';
import { transactionsRouter } from './routes/transactions.js';
import { walletsRouter } from './routes/wallets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN.split(',').map((item) => item.trim()),
      credentials: false
    })
  );
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api', walletsRouter);
  app.use('/api', transactionsRouter);
  app.use('/api', gatewayRouter);

  const frontendDist = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
      if (err) next();
    });
  });

  app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Internal server error';

    const status = error?.statusCode || error?.response?.status || 500;
    res.status(status).json({ error: message });
  });

  return app;
}
