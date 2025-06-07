const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./src/config');

const app = express();
const PORT = config.server.port;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Routes
const proxyRoutes = require('./src/routes/proxyRoutes');
const healthRoutes = require('./src/routes/healthRoutes');
const larkRoutes = require('./src/routes/larkRoutes');

app.use('/api/proxy', proxyRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/lark', larkRoutes);

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'AILover Backend - Proxy Server is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong!'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Environment: ${config.server.environment}`);
  console.log(`🔗 Target API: ${config.proxy.targetUrl}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
