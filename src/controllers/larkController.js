const larkService = require('../services/larkService');
const axios = require('axios');

class LarkController {
    async proxyLark(req, res) {
        try {
            console.log('🚀 Handling Lark token request...');

            // Sử dụng proxyService để handle Lark API call
            const result = await larkService.handleProxyLark(req, res);

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
    
    async getLarkDocument(req, res) {
        try {
            console.log('🚀 Handling Lark document request...');

            // Sử dụng larkService để gọi Lark API với token
            const documentId = req.body.documentId;
            const result = await larkService.getLarkDocument(documentId);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('❌ Lark document request error:', {
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

    async exportTestCase(req, res) {
        try {
            console.log('🚀 Handling Lark sheet creation request...');

            // Sử dụng larkService để tạo sheet
            const result = await larkService.exportTestCase(req.body);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('❌ Lark sheet creation error:', {
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

    async exportTestReport(req, res) {
        try {
            console.log('🚀 Handling Lark test report export request...');

            // Sử dụng larkService để tạo sheet cho báo cáo
            const result = await larkService.exportTestReport(req.body);

            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('❌ Lark test report export error:', {
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
}

module.exports = new LarkController();
