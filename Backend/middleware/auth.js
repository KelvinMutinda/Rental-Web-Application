const jwt = require('jsonwebtoken')

// Expects a token signed like: jwt.sign({ id, role }, process.env.JWT_SECRET)
function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (err) {
    res.status(401).json({ message: 'Please log in again.' })
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admins only.' })
  }
  next()
}

module.exports = { auth, adminOnly }