const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const db = require('./config/db');

const app = express();
// ─── CHANGED: update CORS to allow all origins ───
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Session middleware
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport config
require('./config/passport');

// Routes
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');
const profileRoutes = require('./routes/profile');

app.use('/profile', profileRoutes);
app.use('/products', productRoutes);
app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);
app.use('/products/:id/reviews', reviewRoutes);

const verifyToken = require('./middleware/auth');
app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: `✅ Hello ${req.user.name}, you are logged in!` });
});

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🛒 Online Store API is running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});