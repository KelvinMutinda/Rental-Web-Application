const jwt = require('jsonwebtoken');
const Register = require('../models/register');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Please log in' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Register.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Account not found' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Session expired, please log in again' });
  }
}

const requireAdmin = (req, res, next) =>
  req.user && req.user.role === 'admin' ? next() : res.status(403).json({ message: 'Admins only' });

const requireApproved = (req, res, next) =>
  req.user && req.user.status === 'approved'
    ? next()
    : res.status(403).json({ code: 'NOT_APPROVED', message: 'Your application has not been approved yet' });

module.exports = { requireAuth, requireAdmin, requireApproved };
