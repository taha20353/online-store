const db = require('../config/db');

const placeOrder = (req, res) => {
  const userId = req.user.id;

  const getCartSql = 'SELECT * FROM cart WHERE user_id = ?';
  db.query(getCartSql, [userId], (err, cartResults) => {
    if (err) return res.status(500).json({ error: err.message });
    if (cartResults.length === 0) {
      return res.status(404).json({ message: 'No cart found' });
    }

    const cartId = cartResults[0].id;

    const getItemsSql = `
      SELECT ci.product_id, ci.quantity, p.price, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `;
    db.query(getItemsSql, [cartId], (err, items) => {
      if (err) return res.status(500).json({ error: err.message });
      if (items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      // ✅ Check if all items have enough stock
      const outOfStock = items.find(item => item.quantity > item.stock);
      if (outOfStock) {
        return res.status(400).json({
          message: `❌ Not enough stock for product ID ${outOfStock.product_id}`
        });
      }

      // Calculate total
      const total = items.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0);

      // Create the order
      const createOrderSql = 'INSERT INTO orders (user_id, total) VALUES (?, ?)';
      db.query(createOrderSql, [userId, total], (err, orderResult) => {
        if (err) return res.status(500).json({ error: err.message });

        const orderId = orderResult.insertId;

        // Insert order items
        const orderItems = items.map(item => [
          orderId,
          item.product_id,
          item.quantity,
          item.price
        ]);

        const insertItemsSql = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?';
        db.query(insertItemsSql, [orderItems], (err) => {
          if (err) return res.status(500).json({ error: err.message });

          // ✅ Decrease stock for each product
          const updateStockPromises = items.map(item => {
            return new Promise((resolve, reject) => {
              const updateStockSql = 'UPDATE products SET stock = stock - ? WHERE id = ?';
              db.query(updateStockSql, [item.quantity, item.product_id], (err) => {
                if (err) reject(err);
                else resolve();
              });
            });
          });

          Promise.all(updateStockPromises).then(() => {
            // Clear the cart
            const clearCartSql = 'DELETE FROM cart_items WHERE cart_id = ?';
            db.query(clearCartSql, [cartId], (err) => {
              if (err) return res.status(500).json({ error: err.message });

              res.status(201).json({
                message: '✅ Order placed successfully!',
                order_id: orderId,
                total: total
              });
            });
          }).catch(err => {
            res.status(500).json({ error: err.message });
          });
        });
      });
    });
  });
};

// GET all orders for logged in user
const getOrders = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT o.id, o.status, o.total, o.created_at
    FROM orders o
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

// GET single order details
const getOrderById = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const sql = `
    SELECT o.id AS order_id, o.status, o.total, o.created_at,
           p.name AS product, oi.quantity, oi.price
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.id = ? AND o.user_id = ?
  `;

  db.query(sql, [id, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(results);
  });
};

module.exports = { placeOrder, getOrders, getOrderById };