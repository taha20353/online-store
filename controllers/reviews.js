const db = require('../config/db');

// GET reviews for a product
const getReviews = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT r.id, r.rating, r.comment, r.created_at,
           u.name AS user_name
    FROM product_reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Calculate average rating
    const avg = results.length
      ? (results.reduce((sum, r) => sum + r.rating, 0) / results.length).toFixed(1)
      : 0;

    res.status(200).json({ reviews: results, average: avg, total: results.length });
  });
};

// ADD a review
const addReview = (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: '❌ Rating must be between 1 and 5' });
  }

  // Check if user already reviewed this product
  const checkSql = 'SELECT * FROM product_reviews WHERE product_id = ? AND user_id = ?';
  db.query(checkSql, [id, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      return res.status(400).json({ message: '❌ You already reviewed this product' });
    }

    const sql = 'INSERT INTO product_reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)';
    db.query(sql, [id, userId, rating, comment], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: '✅ Review added!' });
    });
  });
};

// DELETE a review
const deleteReview = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const sql = 'DELETE FROM product_reviews WHERE id = ? AND user_id = ?';
  db.query(sql, [id, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json({ message: '✅ Review deleted!' });
  });
};

module.exports = { getReviews, addReview, deleteReview };