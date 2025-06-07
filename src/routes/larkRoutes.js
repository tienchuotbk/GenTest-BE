const express = require('express');
const router = express.Router();
const larkController = require('../controllers/larkController');

// Proxy lark - specific route for Lark API token
router.get('/token', larkController.proxyLark); // GET method để lấy token

router.post('/document', larkController.getLarkDocument); // GET method để gọi Lark API với token

router.post('/export-test-case', larkController.exportTestCase); // POST method để tạo sheet

router.post('/export-test-report', larkController.exportTestReport); // POST method để tạo sheet

module.exports = router;
