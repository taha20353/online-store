const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
},
(accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;
  const name = profile.displayName;

  // Check if user already exists
  const findSql = 'SELECT * FROM users WHERE email = ?';
  db.query(findSql, [email], (err, results) => {
    if (err) return done(err);

    if (results.length > 0) {
      // User exists — return them
      return done(null, results[0]);
    }

    // User doesn't exist — create them
    const insertSql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(insertSql, [name, email, 'google-oauth', 'customer'], (err, result) => {
      if (err) return done(err);

      const newUser = { id: result.insertId, name, email, role: 'customer' };
      return done(null, newUser);
    });
  });
}));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    done(err, results[0]);
  });
});