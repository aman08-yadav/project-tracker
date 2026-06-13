require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const helmet = require('helmet');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const initSockets = require('./sockets/socketHandler');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const fileRoutes = require('./routes/fileRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const notificationPreferencesRoutes = require('./routes/notificationPreferencesRoutes');
const rankingRoutes = require('./routes/rankingRoutes');

const loggerMiddleware = require('./middleware/loggerMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initSockets(server);
app.set('io', io);

// Trust Render's HTTPS proxy (required for secure cookies on Render)
app.set('trust proxy', 1);

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',  // true on Render (HTTPS)
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../client')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Prevent favicon 404 console errors
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Custom Logger Middleware
app.use(loggerMiddleware);

// API Versioning
const apiRouter = express.Router();
apiRouter.use('/auth', authLimiter, authRoutes);
apiRouter.use('/projects', apiLimiter, projectRoutes);
apiRouter.use('/tasks', apiLimiter, taskRoutes);
apiRouter.use('/files', apiLimiter, fileRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/notifications', apiLimiter, notificationRoutes);
apiRouter.use('/notification-preferences', apiLimiter, notificationPreferencesRoutes);
apiRouter.use('/ranking', apiLimiter, rankingRoutes);

app.use('/api/v1', apiRouter);

// Health check endpoint (for Render uptime monitoring)
// Returns 200 even when DB is still connecting so Render doesn't kill the dyno during cold start.
app.get('/api/v1/health', async (req, res) => {
  const readyState = mongoose.connection.readyState;
  // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  if (readyState === 1) {
    try {
      await mongoose.connection.db.admin().ping();
      return res.json({ status: 'ok', uptime: process.uptime() });
    } catch {
      return res.status(503).json({ status: 'error', message: 'Database unreachable' });
    }
  }
  // DB still connecting — return 200 with degraded status so Render keeps the instance alive
  res.json({ status: 'degraded', db: readyState === 2 ? 'connecting' : 'disconnected', uptime: process.uptime() });
});

// Route root to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/html/index.html'));
});

// SPA fallback / 404 handler
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.status(404).sendFile(path.join(__dirname, '../client/html/404.html'));
  } else {
    res.status(404).json({ success: false, message: 'API route not found' });
  }
});

// Global Error Handler
app.use(errorMiddleware);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5001;

// Start HTTP server immediately so Render's health check responds during cold start
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

// Connect to MongoDB in the background (non-blocking)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    // Don't exit — let the server keep running; health check will report degraded state
  });
