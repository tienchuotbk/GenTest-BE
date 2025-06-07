require('dotenv').config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 9000,
    host: process.env.HOST || 'localhost',
    environment: process.env.NODE_ENV || 'development'
  },

  // Proxy configuration
  proxy: {
    targetUrl: process.env.TARGET_API_URL || 'https://jsonplaceholder.typicode.com',
    timeout: parseInt(process.env.API_TIMEOUT) || 30000,
    retries: parseInt(process.env.API_RETRIES) || 3,
    retryDelay: parseInt(process.env.API_RETRY_DELAY) || 1000
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ],
    credentials: process.env.CORS_CREDENTIALS === 'true'
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // requests per window
    skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true'
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== 'false'
  },

  // Security
  security: {
    helmet: {
      contentSecurityPolicy: process.env.CSP_ENABLED === 'true',
      crossOriginEmbedderPolicy: false
    }
  },

  // Health check
  health: {
    enableDetailedInfo: process.env.HEALTH_DETAILED !== 'false'
  }
};

// Validate required configurations
const validateConfig = () => {
  const errors = [];

  if (!config.proxy.targetUrl) {
    errors.push('TARGET_API_URL is required');
  }

  if (config.proxy.targetUrl && !isValidUrl(config.proxy.targetUrl)) {
    errors.push('TARGET_API_URL must be a valid URL');
  }

  if (errors.length > 0) {
    console.error('❌ Configuration errors:');
    errors.forEach(error => console.error(`   - ${error}`));
    process.exit(1);
  }
};

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// Development mode specific settings
if (config.server.environment === 'development') {
  config.logging.level = 'debug';
  config.health.enableDetailedInfo = true;
}

// Production mode specific settings
if (config.server.environment === 'production') {
  config.security.helmet.contentSecurityPolicy = true;
  config.cors.origin = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
}

// Validate configuration on startup
validateConfig();

// Log configuration (without sensitive data)
console.log('⚙️  Configuration loaded:');
console.log(`   Environment: ${config.server.environment}`);
console.log(`   Port: ${config.server.port}`);
console.log(`   Target API: ${config.proxy.targetUrl}`);
console.log(`   Timeout: ${config.proxy.timeout}ms`);

module.exports = config;
