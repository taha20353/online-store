const express = require('express');
const router = express.Router({ mergeParams: true });
const { getReviews, addReview, deleteReview } = require('../controllers/reviews');
const verifyToken = require('../middleware/auth');

router.get('/', getReviews);
router.post('/', verifyToken, addReview);
router.delete('/:reviewId', verifyToken, deleteReview);

module.exports = router;