const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth');

router.post('/register', register);   // POST /auth/register
router.post('/login', login);         // POST /auth/login
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    //update if redirect not working
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user.id, name: req.user.name, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth-success.html?token=${token}&name=${req.user.name}&email=${req.user.email}`);
  }
);

module.exports = router;