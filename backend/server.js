const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const { apiLimiter, authLimiter, orderLimiter, couponLimiter } = require('./middleware/rateLimit');
const { initializeDB } = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const logger = require('./utils/logger');
require('dotenv').config();

// Initialize App
const app = express();
const PORT = process.env.PORT || 4000;

// Trust the first proxy hop (Render's load balancer / reverse proxy).
// Required for express-rate-limit to correctly read X-Forwarded-For headers
// and avoid ERR_ERL_UNEXPECTED_X_FORWARDED_FOR in production.
app.set('trust proxy', 1);

// Security Headers
app.use(helmet());

// CORS — allow Vercel frontend + localhost in dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,          // e.g. https://yourapp.vercel.app
].filter(Boolean).map(url => url.trim().replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    
    const sanitizedOrigin = origin.trim().replace(/\/$/, '');
    if (allowedOrigins.includes(sanitizedOrigin)) {
      return callback(null, true);
    }
    
    console.warn(`CORS block triggered. Origin: "${origin}". Allowed Origins:`, allowedOrigins);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Serve static uploaded food images from uploads folder
app.use('/images', express.static(path.join(__dirname, 'uploads')));

// Routes Mounting
const userRouter = require('./routes/userRoutes');
const foodRouter = require('./routes/foodRoutes');
const cartRouter = require('./routes/cartRoutes');
const orderRouter = require('./routes/orderRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const couponRouter = require('./routes/couponRoutes');
const deliveryRouter = require('./routes/deliveryRoutes');
const deliveryTimeRouter = require('./routes/deliveryTimeRoutes');
const taxRouter = require('./routes/taxRoutes');
const refundRouter = require('./routes/refundRoutes');
const exportRouter = require('./routes/exportRoutes');
const testimonialRouter = require('./routes/testimonialRoutes');
const cateringRouter   = require('./routes/cateringRoutes');

app.use('/api/user', apiLimiter, userRouter);
app.use('/api/food', apiLimiter, foodRouter);
app.use('/api/cart', apiLimiter, cartRouter);
app.use('/api/order', apiLimiter, orderRouter);
app.use('/api/review', apiLimiter, reviewRouter);
app.use('/api/coupon', apiLimiter, couponRouter);
app.use('/api/delivery', apiLimiter, deliveryRouter);
app.use('/api/delivery-time', apiLimiter, deliveryTimeRouter);
app.use('/api/tax', apiLimiter, taxRouter);
app.use('/api/refund', apiLimiter, refundRouter);
app.use('/api/export', apiLimiter, exportRouter);
app.use('/api/testimonial', apiLimiter, testimonialRouter);
app.use('/api/catering',   apiLimiter, cateringRouter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health Check / Fallback API
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: "Joel. Gastronomy API is live and healthy." });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.message, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send("Joel. Artisan Gastronomy API is running.");
  });
}

// Server Start
async function startServer() {
  // Initialize database connection before starting server
  await initializeDB();
  
  app.listen(PORT, () => {
    logger.info(`Joel. Artisan Gastronomy API is running on port ${PORT}`, {
      port: PORT,
      environment: process.env.NODE_ENV || 'development'
    });
    logger.info(`FRONTEND_URL configured as: ${process.env.FRONTEND_URL || '(not set)'}`);
    logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
  });
}

startServer().catch(err => {
  logger.error('Failed to start server:', err);
});

