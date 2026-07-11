const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { cloudinary, upload } = require('../config/cloudinary');

// ─── GET profile ───
const getProfile = (req, res) => {
  const userId = req.user.id;
  const sql = 'SELECT id, name, email, phone, profile_picture, role, created_at FROM users WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(results[0]);
  });
};

// ─── UPDATE profile info ───
const updateProfile = (req, res) => {
  const userId = req.user.id;
  const { name, phone } = req.body;
  if (!name) return res.status(400).json({ message: '❌ Name is required' });
  const sql = 'UPDATE users SET name = ?, phone = ? WHERE id = ?';
  db.query(sql, [name, phone, userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: '✅ Profile updated!' });
  });
};

// ─── UPDATE profile picture ───
const updateProfilePicture = (req, res) => {
  const userId = req.user.id;
  if (!req.file) return res.status(400).json({ message: '❌ No image uploaded' });
  const imageUrl = req.file.path;
  const sql = 'UPDATE users SET profile_picture = ? WHERE id = ?';
  db.query(sql, [imageUrl, userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: '✅ Profile picture updated!', image_url: imageUrl });
  });
};

// ─── CHANGE password ───
const changePassword = (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: '❌ All fields are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: '❌ Password must be at least 6 characters' });
  }

  db.query('SELECT password FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const user = results[0];

    if (user.password === 'google-oauth') {
      return res.status(400).json({ message: '❌ Google accounts cannot change password here' });
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '❌ Current password is incorrect' });
    }

    const hashed = bcrypt.hashSync(newPassword, 10);
    db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json({ message: '✅ Password changed successfully!' });
    });
  });
};

// ─── GET addresses ───
const getAddresses = (req, res) => {
  const userId = req.user.id;
  db.query('SELECT * FROM addresses WHERE user_id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

// ─── ADD address ───
const addAddress = (req, res) => {
  const userId = req.user.id;
  const { full_name, phone, street, city, country, is_default } = req.body;

  if (!full_name || !phone || !street || !city || !country) {
    return res.status(400).json({ message: '❌ All address fields are required' });
  }

  if (is_default) {
    db.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
    });
  }

  const sql = 'INSERT INTO addresses (user_id, full_name, phone, street, city, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [userId, full_name, phone, street, city, country, is_default ? 1 : 0], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: '✅ Address added!', id: result.insertId });
  });
};

// ─── DELETE address ───
const deleteAddress = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  db.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ message: 'Address not found' });
    res.status(200).json({ message: '✅ Address deleted!' });
  });
};

// ─── SET default address ───
const setDefaultAddress = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query('UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?', [id, userId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json({ message: '✅ Default address updated!' });
    });
  });
};

module.exports = {
  getProfile, updateProfile, updateProfilePicture,
  changePassword, getAddresses, addAddress,
  deleteAddress, setDefaultAddress
};