// ========================================
// Backend Entry Point: Express Server
// ========================================
import express from 'express';
import cors from 'cors';
import { createContainer } from './infrastructure/di/container.js';
import { createRoutes } from './presentation/routes/index.js';
import { seedExercises } from './infrastructure/database/seed.js';
import { closeDatabase } from './infrastructure/database/connection.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

const app = express();

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// DI Container
const container = createContainer();

// Seed default exercises
seedExercises();

// Routes
app.use('/api', createRoutes(container));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🏋️ Mascle API Server running on http://localhost:${PORT}`);
  console.log(`📖 API: http://localhost:${PORT}/api`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('\n🛑 Shutting down...');
  closeDatabase();
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
