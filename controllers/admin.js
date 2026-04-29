const db = require('../config/db');

// ─── ORDERS ──────────────────────────────────────────

// GET all orders with user details
const getAllOrders = (req, res) => {
  const sql = `
    SELECT o.id, o.status, o.total, o.created_at,
           u.name AS customer, u.email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

// GET single order with its items
const getOrderDetails = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT o.id AS order_id, o.status, o.total, o.created_at,
           u.name AS customer, u.email,
           p.name AS product, oi.quantity, oi.price
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.id = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(results);
  });
};

// UPDATE order status
const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: '❌ Invalid status' });
  }

  const sql = 'UPDATE orders SET status = ? WHERE id = ?';
  db.query(sql, [status, id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: '✅ Order status updated!' });
  });
};

// ─── PRODUCTS ─────────────────────────────────────────

// GET all products
const getAllProducts = (req, res) => {
  const sql = `
    SELECT p.id, p.name, p.description, p.price, p.stock,
           p.image_url, c.name AS category, p.category_id
    FROM products p
    JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

// ADD new product
const addProduct = (req, res) => {
  const { name, description, price, stock, image_url, category_id } = req.body;

  if (!name || !price || !category_id) {
    return res.status(400).json({ message: '❌ Name, price and category are required' });
  }

  const sql = 'INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, description, price, stock, image_url, category_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: '✅ Product added!', id: results.insertId });
  });
};

// UPDATE product
const updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, image_url, category_id } = req.body;

  const sql = `
    UPDATE products 
    SET name=?, description=?, price=?, stock=?, image_url=?, category_id=?
    WHERE id=?
  `;
  db.query(sql, [name, description, price, stock, image_url, category_id, id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: '✅ Product updated!' });
  });
};

// DELETE product
const deleteProduct = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM products WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: '✅ Product deleted!' });
  });
};

// GET all categories
const getCategories = (req, res) => {
  db.query('SELECT * FROM categories', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

// GET dashboard stats
const getStats = (req, res) => {
  const stats = {};

  db.query('SELECT COUNT(*) AS total FROM orders', (err, r) => {
    if (err) return res.status(500).json({ error: err.message });
    stats.totalOrders = r[0].total;

    db.query('SELECT SUM(total) AS revenue FROM orders WHERE status != "cancelled"', (err, r) => {
      if (err) return res.status(500).json({ error: err.message });
      stats.totalRevenue = r[0].revenue || 0;

      db.query('SELECT COUNT(*) AS total FROM users WHERE role = "customer"', (err, r) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.totalCustomers = r[0].total;

        db.query('SELECT COUNT(*) AS total FROM products', (err, r) => {
          if (err) return res.status(500).json({ error: err.message });
          stats.totalProducts = r[0].total;

          res.status(200).json(stats);
        });
      });
    });
  });
};

module.exports = {
  getAllOrders, getOrderDetails, updateOrderStatus,
  getAllProducts, addProduct, updateProduct, deleteProduct,
  getCategories, getStats
};