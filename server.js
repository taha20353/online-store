const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const db = require('./config/db');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

app.use('/products', productRoutes);    
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🛒 Online Store API is running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Test protected route
const verifyToken = require('./middleware/auth');
app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: `✅ Hello ${req.user.name}, you are logged in!` });
});

const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);