const jwt = require('jsonwebtoken');
const db = require('../config/database');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const result = await db.query(
        'SELECT id, username, email, role_id FROM users WHERE id = $1',
        [decoded.id]
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      req.user = result.rows[0];
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  db.query('SELECT name FROM roles WHERE id = $1', [req.user.role_id])
    .then(result => {
      if (result.rows[0]?.name === 'admin') {
        next();
      } else {
        res.status(403).json({ message: 'Admin access required' });
      }
    })
    .catch(() => {
      res.status(500).json({ message: 'Server error' });
    });
};

module.exports = { protect, admin };