const proxyService = require('../services/proxyService');
const axios = require('axios');

class ProxyController {  // GET proxy
    async getProxy(req, res) {
        try {
            const endpoint = req.params[0] || req.path.replace('/api/proxy/', '');
            const queryParams = req.query;

            const result = await proxyService.forwardGetRequest(endpoint, queryParams);

            res.status(200).json({
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Proxy GET Error:', error);
            res.status(error.status || 500).json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    // POST proxy
    async postProxy(req, res) {
        try {
            const endpoint = req.params[0] || req.path.replace('/api/proxy/', '');
            const body = req.body;
            const queryParams = req.query;

            const result = await proxyService.forwardPostRequest(endpoint, body, queryParams);

            res.status(200).json({
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Proxy POST Error:', error);
            res.status(error.status || 500).json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    // PUT proxy
    async putProxy(req, res) {
        try {
            const endpoint = req.params[0] || req.path.replace('/api/proxy/', '');
            const body = req.body;
            const queryParams = req.query;

            const result = await proxyService.forwardPutRequest(endpoint, body, queryParams);

            res.status(200).json({
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Proxy PUT Error:', error);
            res.status(error.status || 500).json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    // DELETE proxy
    async deleteProxy(req, res) {
        try {
            const endpoint = req.params[0] || req.path.replace('/api/proxy/', '');
            const queryParams = req.query;

            const result = await proxyService.forwardDeleteRequest(endpoint, queryParams);

            res.status(200).json({
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Proxy DELETE Error:', error);
            res.status(error.status || 500).json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
    async proxyLark(req, res) {
        try {
            console.log('🚀 Handling Lark token request...');

            // Sử dụng proxyService để handle Lark API call
            const result = await proxyService.handleProxyLark(req, res);

            res.status(200).json(result);

        } catch (error) {
            console.error('❌ Lark proxy error:', {
                message: error.message,
                status: error.status,
                data: error.data
            });

            res.status(error.status || 500).json({
                success: false,
                error: error.message,
                details: error.data,
                timestamp: new Date().toISOString()
            });
        }
    }
    // Helper method để gọi Lark API với token
    async callLarkAPIWithToken(req, res) {
        try {
            const endpoint = req.params[0] || req.path.replace('/api/proxy/lark/', '');
            const method = req.method;
            const data = req.body;

            console.log(`🔄 Calling Lark API: ${method} ${endpoint}`);

            const result = await proxyService.callLarkAPI(endpoint, method, data, true);

            res.status(200).json({
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('❌ Lark API call error:', error.message);

            res.status(error.status || 500).json({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
}

module.exports = new ProxyController();
