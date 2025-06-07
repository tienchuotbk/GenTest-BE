const os = require('os');
const process = require('process');

class HealthService {
  async getHealthStatus() {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    return {
      status: 'healthy',
      uptime: {
        seconds: Math.floor(uptime),
        formatted: this.formatUptime(uptime)
      },
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
        external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB'
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        cpuCount: os.cpus().length,
        freeMemory: Math.round(os.freemem() / 1024 / 1024) + ' MB',
        totalMemory: Math.round(os.totalmem() / 1024 / 1024) + ' MB'
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000,
        targetApiUrl: process.env.TARGET_API_URL || 'Not configured'
      },
      timestamp: new Date().toISOString()
    };
  }

  formatUptime(uptimeSeconds) {
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return parts.join(' ') || '0s';
  }

  async checkTargetApiHealth() {
    // This method can be used to check if target API is reachable
    // Implementation depends on target API requirements
    try {
      const proxyService = require('./proxyService');
      // You can implement a health check endpoint call here
      return { status: 'connected' };
    } catch (error) {
      return { status: 'disconnected', error: error.message };
    }
  }
}

module.exports = new HealthService();
