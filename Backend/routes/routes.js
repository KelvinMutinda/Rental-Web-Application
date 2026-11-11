const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Register = require('../models/register');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneno, regno, course, password } = req.body;

    if (![firstName, lastName, email, phoneno, regno, course, password].every(Boolean)) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const exists = await Register.findOne({ $or: [{ email: email.toLowerCase() }, { regno }] });
    if (exists) {
      return res.status(409).json({ message: 'Email or registration number already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await Register.create({
      firstName, lastName, email, phoneno, regno, course, password: hashed,
    });

    // Tell any open admin dashboards there is a new application
    const notifyAdmins = req.app.get('notifyAdmins');
    if (notifyAdmins) notifyAdmins('applications:changed', { type: 'created', id: user._id });

    res.status(201).json({
      message: 'Registered successfully',
      user: { id: user._id, firstName: user.firstName, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Register.findOne({ email: (email || '').toLowerCase() });
    const ok = user && await bcrypt.compare(password || '', user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, firstName: user.firstName, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;