const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById } = require('../controllers/products');
const verifyToken = require('../middleware/auth');


router.get('/', getAllProducts);         // GET /products
router.get('/:id', getProductById);     // GET /products/1

module.exports = router;