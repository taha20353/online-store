const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const verifyAdmin = require('../middleware/admin');
const { upload } = require('../config/cloudinary');
const {
  getAllOrders, getOrderDetails, updateOrderStatus,
  getAllProducts, addProduct, updateProduct, deleteProduct,
  getCategories, getStats,
  uploadImages, deleteImage, getProductImages
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

// Product images
router.post('/products/:id/images', upload.array('images', 5), uploadImages);
router.delete('/images/:id', deleteImage);
router.get('/products/:id/images', getProductImages);

module.exports = router;