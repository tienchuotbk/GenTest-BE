const express = require('express');
const router = express.Router();
const proxyController = require('../controllers/proxyController');

// Proxy lark - specific route for Lark API token
router.post('/lark', proxyController.proxyLark);
router.get('/lark/token', proxyController.proxyLark); // GET method để lấy token

// Proxy routes - catch all endpoints
router.get('/*', proxyController.getProxy);
router.post('/*', proxyController.postProxy);
router.put('/*', proxyController.putProxy);
router.delete('/*', proxyController.deleteProxy);



// Specific endpoint examples (uncomment and modify as needed)
/*
router.get('/users', proxyController.getProxy);
router.post('/users', proxyController.postProxy);
router.put('/users/:id', proxyController.putProxy);
router.delete('/users/:id', proxyController.deleteProxy);

router.get('/posts', proxyController.getProxy);
router.post('/posts', proxyController.postProxy);
*/

module.exports = router;
