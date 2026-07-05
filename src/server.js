require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const workflowRoutes = require('./routes/workflows');
const executionRoutes = require('./routes/executions');
const credentialRoutes = require('./routes/credentials');
const webhookRoutes = require('./routes/webhooks');
const { startScheduler } = require('./services/cronScheduler');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());

// CORS: erlaubt die konfigurierte FRONTEND_ORIGIN sowie automatisch
// jede *.up.railway.app Domain (robuster gegen Tippfehler/fehlendes https://
// in der Umgebungsvariable, da Railway-Domains ohnehin unter deiner Kontrolle sind).
const allowedOrigin = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173').replace(/\/$/, '');

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // z.B. Server-zu-Server, curl, etc.

      const normalizedOrigin = origin.replace(/\/$/, '');
      const isConfiguredOrigin = normalizedOrigin === allowedOrigin;
      const isRailwayDomain = /^https:\/\/[a-z0-9-]+\.up\.railway\.app$/i.test(normalizedOrigin);
      const isLocalhost = /^http:\/\/localhost:\d+$/.test(normalizedOrigin);

      if (isConfiguredOrigin || isRailwayDomain || isLocalhost) {
        return callback(null, true);
      }

      logger.warn('CORS: Origin abgelehnt', { origin, allowedOrigin });
      return callback(new Error('Nicht erlaubte Origin'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));

// Globales Rate-Limit als Grundschutz
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
});
app.use(globalLimiter);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/credentials', credentialRoutes);
// Webhooks sind bewusst öffentlich - eigener Pfad ohne /api Prefix
app.use('/webhook', webhookRoutes);

// Zentrale Fehlerbehandlung
app.use((err, req, res, next) => {
  logger.error('Unbehandelter Fehler', { error: err.message, stack: err.stack });
  res.status(err.statusCode || 500).json({ error: err.message || 'Interner Serverfehler' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info(`Backend läuft auf Port ${PORT}`);
  startScheduler();
});
