require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { seedDemoAccounts } = require('./services/userService');
const { errorHandler } = require('./middleware/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const consumerRoutes = require('./routes/consumerRoutes');
const bulkBuyerRoutes = require('./routes/bulkBuyerRoutes');
const driverRoutes = require('./routes/driverRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger
app.use((req, res, next) => {
  const time = new Date().toLocaleTimeString();
  if (req.method !== 'OPTIONS') {
    console.log(`📡 [${time}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'AgroBridge Agricultural Disintermediation & Logistics Platform',
    version: '1.0.0',
    authRoles: ['FARMER', 'CONSUMER', 'BULK_BUYER', 'DRIVER', 'ADMIN'],
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const marketplaceRoutes = require('./routes/marketplaceRoutes');
const aiRoutes = require('./routes/aiRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const ivrRoutes = require('./routes/ivrRoutes');
const mandiRoutes = require('./routes/mandiRoutes');
const marketPriceRoutes = require('./routes/marketPriceRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/consumer', consumerRoutes);
app.use('/api/bulk-buyer', bulkBuyerRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', marketplaceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/ivr', ivrRoutes);
app.use('/api/mandi', mandiRoutes);
app.use('/api/market-prices', marketPriceRoutes);

const path = require('path');
const fs = require('fs');

// Ensure and serve static uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Serve static frontend assets if built
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

// SPA Fallback: non-API and non-upload routes return index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server and Initialize DB
let dbInitialized = false;

async function startServer(port = PORT) {
  if (!dbInitialized) {
    await connectDB();
    await seedDemoAccounts();
    dbInitialized = true;
  }

  const server = app.listen(port, () => {
    console.log(`==================================================`);
    console.log(`🌾 AgroBridge Role-Based Server running on port ${port}`);
    console.log(`🔗 Health Check: http://localhost:${port}/api/health`);
    console.log(`==================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} is currently busy. Automatically binding to port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer();

module.exports = app;
