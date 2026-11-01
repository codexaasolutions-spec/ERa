import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import fs from 'fs';

import { env, allowedOrigins } from './config/env.js';
import { connectDB } from './config/db.js';
import { router } from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { startCycleJob } from './jobs/cycleJob.js';
import { initializeWallets } from './services/ledger.js';

const app = express();
app.set('trust proxy', 1);

const cspDirectives = helmet.contentSecurityPolicy.getDefaultDirectives();
cspDirectives['img-src'] = ["'self'", "data:", "blob:"];
app.use(helmet({ contentSecurityPolicy: { directives: cspDirectives } }));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.map(x => x.replace(/\/$/, '')).includes(origin.replace(/\/$/, ''))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'production' ? 300 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use('/api', router);

app.get('/api/db-check', (_req, res) => {
  res.json({
    connected: mongoose.connection.readyState === 1,
    database: mongoose.connection.db?.databaseName ?? null,
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidates = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
];

const clientDist = candidates.find(p => fs.existsSync(path.join(p, 'index.html')));

if (!clientDist) {
  console.error('[STATIC ERROR] client/dist/index.html not found. Checked:', candidates);
} else {
  console.log('[STATIC] Serving frontend from:', clientDist);
  app.use(express.static(clientDist, {
    index: false,
    fallthrough: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
      if (filePath.endsWith('.css')) res.setHeader('Content-Type', 'text/css; charset=utf-8');
    },
  }));
}

app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api')) return next();

  if (clientDist && fs.existsSync(path.join(clientDist, 'index.html'))) {
    return res.sendFile(path.join(clientDist, 'index.html'));
  }

  res.status(503).send('Frontend build is missing on the server.');
});

app.use(notFound);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('[API ERROR]', {
    name: err?.name,
    message: err?.message,
    code: err?.code,
  });

  res.status(Number(err?.statusCode) || 500).json({
    message: Number(err?.statusCode) && err?.statusCode < 500
      ? String(err.message || 'Request failed')
      : 'Internal server error',
  });
});

app.listen(env.PORT, () => {
  console.log(`API listening on ${env.PORT}`);
});

connectDB()
  .then(async () => {
    if (env.MONGODB_TRANSACTIONS_REQUIRED) {
      const topology = (mongoose.connection.getClient() as any).topology?.description?.type;

      if (!['ReplicaSetWithPrimary', 'Sharded'].includes(topology)) {
        throw new Error('MONGODB_TRANSACTIONS_REQUIRED is enabled but MongoDB is not transaction-capable. Use a replica set or sharded cluster.');
      }
    }

    await initializeWallets();
    startCycleJob();
    console.log('[STARTUP] Database initialization complete');
  })
  .catch((e) => {
    console.error('[STARTUP ERROR]', e?.message || e);
  });

const shutdown = async (signal: string) => {
  console.log(`${signal}: shutting down`);
  await mongoose.connection.close(false).catch(() => undefined);
  process.exit(0);
};

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));

