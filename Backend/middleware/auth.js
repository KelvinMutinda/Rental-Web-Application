const jwt = require('jsonwebtoken')
const Register = require('../models/register')

// Verifies the token and loads the user from the database into req.user
async function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (!token) return res.status(401).json({ message: 'Please log in.' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await Register.findById(decoded.id)
    if (!user) return res.status(401).json({ message: 'Please log in again.' })
    req.user = user
    next()
  } catch (err) {
    res.status(401).json({ message: 'Please log in again.' })
  }
}

// Tenants whose registration the admin has approved
function requireApproved(req, res, next) {
  if (req.user?.status !== 'approved') {
    return res.status(403).json({ message: 'Your account is waiting for admin approval.' })
  }
  next()
}

// Must run after requireAuth
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only.' })
  }
  next()
}

module.exports = { requireAuth, requireApproved, requireAdmin }