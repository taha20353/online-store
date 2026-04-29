const express = require('express');
const router = express.Router();
const { placeOrder, getOrders, getOrderById } = require('../controllers/orders');
const verifyToken = require('../middleware/auth');

// All order routes are protected
router.post('/', verifyToken, placeOrder);
router.get('/', verifyToken, getOrders);
router.get('/:id', verifyToken, getOrderById);

module.exports = router;