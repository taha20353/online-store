const db = require('../config/db');

// GET all products
const getAllProducts = (req, res) => {
  const sql = `
    SELECT p.id, p.name, p.description, p.price, p.stock, 
           p.image_url, c.name AS category
    FROM products p
    JOIN categories c ON p.category_id = c.id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
};

// GET single product by ID
const getProductById = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.id, p.name, p.description, p.price, p.stock, 
           p.image_url, c.name AS category
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(results[0]);
  });
};

module.exports = { getAllProducts, getProductById };