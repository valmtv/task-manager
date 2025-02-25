const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const [users] = await pool.query('SELECT id FROM Users WHERE id = ?', [decoded.id]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found' });
    }
    req.user = { id: users[0].id };
    next();
  } catch (err) {
    console.error('Authentication error:', err.message);
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
};

module.exports = authMiddleware;
