const db = require('../config/db');

// GET user's cart
const getCart = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT ci.id, p.name, p.price, p.image_url, ci.quantity,
           (p.price * ci.quantity) AS subtotal
    FROM cart_items ci
    JOIN cart c ON ci.cart_id = c.id
    JOIN products p ON ci.product_id = p.id
    WHERE c.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

// ADD item to cart
const addToCart = (req, res) => {
  const userId = req.user.id;
  const { product_id, quantity } = req.body;

  // Check if user already has a cart
  const findCartSql = 'SELECT * FROM cart WHERE user_id = ?';
  db.query(findCartSql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      // Create a new cart for the user
      const createCartSql = 'INSERT INTO cart (user_id) VALUES (?)';
      db.query(createCartSql, [userId], (err, cartResult) => {
        if (err) return res.status(500).json({ error: err.message });
        insertCartItem(cartResult.insertId, product_id, quantity, res);
      });
    } else {
      // Cart already exists
      insertCartItem(results[0].id, product_id, quantity, res);
    }
  });
};

// Helper function to insert cart item
const insertCartItem = (cartId, productId, quantity, res) => {
  // Check if product already in cart
  const checkSql = 'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?';
  db.query(checkSql, [cartId, productId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      // Product exists in cart — update quantity
      const updateSql = 'UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?';
      db.query(updateSql, [quantity, cartId, productId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: '✅ Cart updated!' });
      });
    } else {
      // Product not in cart — insert new item
      const insertSql = 'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)';
      db.query(insertSql, [cartId, productId, quantity], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: '✅ Item added to cart!' });
      });
    }
  });
};

// REMOVE item from cart
const removeFromCart = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM cart_items WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json({ message: '✅ Item removed from cart!' });
  });
};

module.exports = { getCart, addToCart, removeFromCart };


// UPDATE quantity of cart item
const updateCartItem = (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1' });
  }

  const sql = 'UPDATE cart_items SET quantity = ? WHERE id = ?';
  db.query(sql, [quantity, id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json({ message: '✅ Quantity updated!' });
  });
};

module.exports = { getCart, addToCart, removeFromCart, updateCartItem };