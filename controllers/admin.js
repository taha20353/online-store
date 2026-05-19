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

const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: '❌ Invalid status' });
  }

  // Get current order status first
  const getCurrentSql = 'SELECT status FROM orders WHERE id = ?';
  db.query(getCurrentSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const currentStatus = results[0].status;

    // If changing TO cancelled — restore stock
    if (status === 'cancelled' && currentStatus !== 'cancelled') {
      const getItemsSql = `
        SELECT product_id, quantity 
        FROM order_items 
        WHERE order_id = ?
      `;
      db.query(getItemsSql, [id], (err, items) => {
        if (err) return res.status(500).json({ error: err.message });

        // Restore stock for each item
        const restorePromises = items.map(item => {
          return new Promise((resolve, reject) => {
            const restoreSql = 'UPDATE products SET stock = stock + ? WHERE id = ?';
            db.query(restoreSql, [item.quantity, item.product_id], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        });

        Promise.all(restorePromises).then(() => {
          // Now update order status
          updateStatus(id, status, res);
        }).catch(err => {
          res.status(500).json({ error: err.message });
        });
      });
    }

    // If changing FROM cancelled to something else — deduct stock again
    else if (currentStatus === 'cancelled' && status !== 'cancelled') {
      const getItemsSql = `
        SELECT product_id, quantity 
        FROM order_items 
        WHERE order_id = ?
      `;
      db.query(getItemsSql, [id], (err, items) => {
        if (err) return res.status(500).json({ error: err.message });

        // Check stock availability first
        const checkPromises = items.map(item => {
          return new Promise((resolve, reject) => {
            db.query('SELECT stock FROM products WHERE id = ?', [item.product_id], (err, results) => {
              if (err) reject(err);
              else if (results[0].stock < item.quantity) {
                reject(new Error(`Not enough stock for product ID ${item.product_id}`));
              }
              else resolve();
            });
          });
        });

        Promise.all(checkPromises).then(() => {
          // Deduct stock
          const deductPromises = items.map(item => {
            return new Promise((resolve, reject) => {
              const deductSql = 'UPDATE products SET stock = stock - ? WHERE id = ?';
              db.query(deductSql, [item.quantity, item.product_id], (err) => {
                if (err) reject(err);
                else resolve();
              });
            });
          });

          return Promise.all(deductPromises);
        }).then(() => {
          updateStatus(id, status, res);
        }).catch(err => {
          res.status(400).json({ message: err.message });
        });
      });
    }

    // No stock change needed
    else {
      updateStatus(id, status, res);
    }
  });
};

// Helper to update order status
const updateStatus = (id, status, res) => {
  db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
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

const deleteProduct = (req, res) => {
  const { id } = req.params;

  // Delete related records first
  db.query('DELETE FROM product_images WHERE product_id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query('DELETE FROM cart_items WHERE product_id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      db.query('DELETE FROM order_items WHERE product_id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        // Now delete the product
        db.query('DELETE FROM products WHERE id = ?', [id], (err, results) => {
          if (err) return res.status(500).json({ error: err.message });
          if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
          }
          res.status(200).json({ message: '✅ Product deleted!' });
        });
      });
    });
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

const { cloudinary } = require('../config/cloudinary');

// UPLOAD product images
const uploadImages = (req, res) => {
  console.log('📸 Upload request received');
  console.log('Files:', req.files);
  console.log('Params:', req.params);

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: '❌ No images uploaded' });
  }

  const productId = req.params.id;
  const isPrimary = req.body.is_primary === 'true';

  const images = req.files.map((file, index) => [
    productId,
    file.path,
    index === 0 && isPrimary ? 1 : 0
  ]);

  console.log('Images to insert:', images);

  const sql = 'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ?';
  db.query(sql, [images], (err) => {
    if (err) {
      console.error('DB Error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: '✅ Images uploaded successfully!',
      images: req.files.map(f => f.path)
    });
  });
};

// DELETE product image
const deleteImage = (req, res) => {
  const { id } = req.params;

  // Get image url first to delete from cloudinary
  db.query('SELECT * FROM product_images WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const imageUrl = results[0].image_url;

    // Extract public_id from cloudinary URL
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1];
    const publicId = `online-store/${filename.split('.')[0]}`;

    // Delete from Cloudinary
    cloudinary.uploader.destroy(publicId, (err) => {
      if (err) console.error('Cloudinary delete error:', err);
    });

    // Delete from database
    db.query('DELETE FROM product_images WHERE id = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json({ message: '✅ Image deleted!' });
    });
  });
};

// GET product images
const getProductImages = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM product_images WHERE product_id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

module.exports = {
  getAllOrders, getOrderDetails, updateOrderStatus,
  getAllProducts, addProduct, updateProduct, deleteProduct,
  getCategories, getStats,
  uploadImages, deleteImage, getProductImages
};