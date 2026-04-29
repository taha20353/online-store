const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart, updateCartItem } = require('../controllers/cart');
const verifyToken = require('../middleware/auth');

router.get('/', verifyToken, getCart);
router.post('/', verifyToken, addToCart);
router.put('/:id', verifyToken, updateCartItem);      // ✅ new
router.delete('/:id', verifyToken, removeFromCart);

module.exports = router;