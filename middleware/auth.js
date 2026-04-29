const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if token exists
  if (!authHeader) {
    return res.status(401).json({ message: '❌ No token provided' });
  }

  // Token format: "Bearer eyJhbGci..."
  const token = authHeader.split(' ')[1];

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: '❌ Invalid or expired token' });
    }

    // Save user info for use in next route
    req.user = decoded;
    next(); // ✅ continue to the route
  });
};

module.exports = verifyToken;