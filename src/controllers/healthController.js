const healthService = require('../services/healthService');

class HealthController {
  // Check health status
  async getHealth(req, res) {
    try {
      const healthData = await healthService.getHealthStatus();
      
      res.status(200).json({
        success: true,
        data: healthData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Health Check Error:', error);
      res.status(500).json({
        success: false,
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  }

  // Simple ping
  async ping(req, res) {
    res.status(200).json({
      success: true,
      message: 'pong',
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new HealthController();
