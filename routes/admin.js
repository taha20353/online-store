const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const verifyAdmin = require('../middleware/admin');
const {
  getAllOrders, getOrderDetails, updateOrderStatus,
  getAllProducts, addProduct, updateProduct, deleteProduct,
  getCategories, getStats
} = require('../controllers/admin');

// All admin routes require token + admin role
router.use(verifyToken, verifyAdmin);

// Dashboard
router.get('/stats', getStats);

// Orders
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderDetails);
router.put('/orders/:id', updateOrderStatus);

// Products
router.get('/products', getAllProducts);
router.post('/products', addProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Categories
router.get('/categories', getCategories);

module.exports = router;