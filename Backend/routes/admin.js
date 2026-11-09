const express = require('express');
const Register = require('../models/register');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireAdmin);

/* GET /api/admin/applications?status=pending|approved|rejected */
router.get('/applications', async (req, res) => {
  const status = ['pending', 'approved', 'rejected'].includes(req.query.status) ? req.query.status : 'pending';
  const list = await Register.find({ role: 'tenant', status }).select('-password').sort({ createdAt: -1 });
  res.json({ applications: list });
});

/* PATCH /api/admin/tenants/:id/approve  { roomNumber, rent, dueDay? } */
router.patch('/tenants/:id/approve', async (req, res) => {
  try {
    const { roomNumber, rent, dueDay } = req.body;
    if (!roomNumber || !(Number(rent) > 0)) return res.status(400).json({ message: 'Room number and a rent above 0 are required' });

    const user = await Register.findOneAndUpdate(
      { _id: req.params.id, role: 'tenant' },
      { status: 'approved', roomNumber: String(roomNumber).trim().toUpperCase(), rent: Number(rent),
        dueDay: Number(dueDay) || 5, approvedAt: new Date(), $unset: { rejectReason: 1 } },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Tenant not found' });
    res.json({ message: `${user.firstName} approved for room ${user.roomNumber}`, user });
  } catch {
    res.status(400).json({ message: 'Invalid request' });
  }
});

/* PATCH /api/admin/tenants/:id/reject  { reason? } */
router.patch('/tenants/:id/reject', async (req, res) => {
  try {
    const user = await Register.findOneAndUpdate(
      { _id: req.params.id, role: 'tenant' },
      { status: 'rejected', rejectReason: (req.body.reason || '').slice(0, 200) },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Tenant not found' });
    res.json({ message: `${user.firstName}'s application was declined`, user });
  } catch {
    res.status(400).json({ message: 'Invalid request' });
  }
});

module.exports = router;
