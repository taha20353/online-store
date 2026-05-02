const db = require('../config/db');

// GET all products
const getAllProducts = (req, res) => {
  const sql = `
    SELECT p.id, p.name, p.description, p.price, p.stock, 
           c.name AS category,
           COALESCE(
             (SELECT image_url FROM product_images 
              WHERE product_id = p.id AND is_primary = 1 LIMIT 1),
             (SELECT image_url FROM product_images 
              WHERE product_id = p.id LIMIT 1),
             p.image_url
           ) AS image_url
    FROM products p
    JOIN categories c ON p.category_id = c.id
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

// GET single product by ID
const getProductById = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.id, p.name, p.description, p.price, p.stock, 
           c.name AS category,
           COALESCE(
             (SELECT image_url FROM product_images 
              WHERE product_id = p.id AND is_primary = 1 LIMIT 1),
             (SELECT image_url FROM product_images 
              WHERE product_id = p.id LIMIT 1),
             p.image_url
           ) AS image_url
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(results[0]);
  });
};

module.exports = { getAllProducts, getProductById };