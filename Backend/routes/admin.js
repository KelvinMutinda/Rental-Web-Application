const express = require('express')
const Register = require('../models/register')
const Payment = require('../models/payment')
const { requireAuth, requireAdmin } = require('../middleware/auth')

const router = express.Router()
router.use(requireAuth, requireAdmin)

const ROOM_TYPES = ['Single', 'Double', 'Bedsitter']
const capacity = (type) => (type === 'Double' ? 2 : 1) // people per room
const notify = (req, event, payload) => {
  const fn = req.app.get('notifyAdmins')
  if (fn) fn(event, payload)
}

// Anyone who is not an admin and has not been decided yet
const PENDING = { role: { $ne: 'admin' }, status: { $nin: ['approved', 'rejected'] } }
const TENANTS = { role: { $ne: 'admin' }, status: 'approved' }

const pad = (n) => String(n).padStart(2, '0')
function currentMonth() {
  const d = new Date(Date.now() + 3 * 3600 * 1000) // Nairobi time
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`
}

/* GET /api/admin/stats */
router.get('/stats', async (req, res) => {
  try {
    const month = currentMonth()
    const [pending, tenants, paid] = await Promise.all([
      Register.countDocuments(PENDING),
      Register.find(TENANTS).select('rent roomNumber'),
      Payment.aggregate([
        { $match: { month, status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ])
    res.json({
      month,
      pending,
      tenants: tenants.length,
      roomsOccupied: new Set(tenants.map((t) => t.roomNumber).filter(Boolean)).size,
      expectedRent: tenants.reduce((sum, t) => sum + (t.rent || 0), 0),
      collected: paid[0]?.total || 0,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

/* GET /api/admin/applications – everyone waiting for a decision */
router.get('/applications', async (req, res) => {
  try {
    res.json(await Register.find(PENDING).select('-password').sort({ createdAt: -1 }))
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

/* GET /api/admin/rejected – rejected applications */
router.get('/rejected', async (req, res) => {
  try {
    res.json(await Register.find({ role: { $ne: 'admin' }, status: 'rejected' }).select('-password').sort({ updatedAt: -1 }))
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

/* DELETE /api/admin/applications/:id – permanently delete a pending or rejected application */
router.delete('/applications/:id', async (req, res) => {
  try {
    const user = await Register.findOneAndDelete({
      _id: req.params.id,
      role: { $ne: 'admin' },
      status: { $ne: 'approved' },
    })
    if (!user) return res.status(404).json({ message: 'Application not found.' })
    notify(req, 'applications:changed', { type: 'deleted', id: req.params.id })
    res.json({ deleted: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

/* PATCH /api/admin/applications/:id/approve  { roomNumber, roomType, rent, dueDay? } */
router.patch('/applications/:id/approve', async (req, res) => {
  try {
    const roomNumber = String(req.body.roomNumber || '').trim()
    const { roomType } = req.body
    const rent = Number(req.body.rent)
    const dueDay = Number(req.body.dueDay) || 5

    if (!roomNumber) return res.status(400).json({ message: 'Enter a room number.' })
    if (!ROOM_TYPES.includes(roomType)) return res.status(400).json({ message: 'Choose a room type.' })
    if (!Number.isFinite(rent) || rent <= 0) return res.status(400).json({ message: 'Enter the monthly rent.' })
    if (dueDay < 1 || dueDay > 28) return res.status(400).json({ message: 'Due day must be between 1 and 28.' })

    const taken = await Register.countDocuments({ ...TENANTS, roomNumber, _id: { $ne: req.params.id } })
    if (taken >= capacity(roomType)) {
      return res.status(409).json({ message: `Room ${roomNumber} is already full.` })
    }

    const user = await Register.findOneAndUpdate(
      { _id: req.params.id, role: { $ne: 'admin' }, status: { $ne: 'approved' } },
      { $set: { status: 'approved', roomNumber, roomType, rent, dueDay }, $unset: { rejectReason: '' } },
      { new: true }
    ).select('-password')
    if (!user) return res.status(400).json({ message: 'This application was already handled.' })

    notify(req, 'applications:changed', { type: 'approved', id: user._id })
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

/* PATCH /api/admin/applications/:id/reject */
router.patch('/applications/:id/reject', async (req, res) => {
  try {
    const user = await Register.findOneAndUpdate(
      { _id: req.params.id, role: { $ne: 'admin' }, status: { $ne: 'approved' } },
      { $set: { status: 'rejected' }, $unset: { rejectReason: '' } },
      { new: true }
    ).select('-password')
    if (!user) return res.status(400).json({ message: 'This application was already handled.' })

    notify(req, 'applications:changed', { type: 'rejected', id: user._id })
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

/* GET /api/admin/tenants – approved tenants */
router.get('/tenants', async (req, res) => {
  try {
    res.json(await Register.find(TENANTS).select('-password').sort({ roomNumber: 1 }))
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

/* PATCH /api/admin/tenants/:id  { rent?, roomNumber?, roomType?, dueDay? } */
router.patch('/tenants/:id', async (req, res) => {
  try {
    const update = {}
    if (req.body.rent !== undefined) {
      const rent = Number(req.body.rent)
      if (!Number.isFinite(rent) || rent < 0) return res.status(400).json({ message: 'Enter a valid rent.' })
      update.rent = rent
    }
    if (req.body.dueDay !== undefined) {
      const dueDay = Number(req.body.dueDay)
      if (dueDay < 1 || dueDay > 28) return res.status(400).json({ message: 'Due day must be between 1 and 28.' })
      update.dueDay = dueDay
    }
    if (req.body.roomType !== undefined) {
      if (!ROOM_TYPES.includes(req.body.roomType)) return res.status(400).json({ message: 'Choose a room type.' })
      update.roomType = req.body.roomType
    }
    if (req.body.roomNumber !== undefined) update.roomNumber = String(req.body.roomNumber).trim()

    if (update.roomNumber || update.roomType) {
      const current = await Register.findById(req.params.id).select('roomNumber roomType')
      if (!current) return res.status(404).json({ message: 'Tenant not found.' })
      const number = update.roomNumber || current.roomNumber
      const type = update.roomType || current.roomType
      const taken = await Register.countDocuments({ ...TENANTS, roomNumber: number, _id: { $ne: req.params.id } })
      if (taken >= capacity(type)) return res.status(409).json({ message: `Room ${number} is already full.` })
    }

    const user = await Register.findOneAndUpdate({ _id: req.params.id, ...TENANTS }, { $set: update }, { new: true }).select('-password')
    if (!user) return res.status(404).json({ message: 'Tenant not found.' })

    notify(req, 'applications:changed', { type: 'updated', id: user._id })
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

/* PATCH /api/admin/tenants/:id/free – take the tenant out of their room and back to the applications list */
router.patch('/tenants/:id/free', async (req, res) => {
  try {
    const user = await Register.findOneAndUpdate(
      { _id: req.params.id, ...TENANTS },
      { $set: { status: 'pending' }, $unset: { roomNumber: '', roomType: '', rent: '', dueDay: '', rejectReason: '' } },
      { new: true }
    ).select('-password')
    if (!user) return res.status(404).json({ message: 'Tenant not found.' })
    notify(req, 'applications:changed', { type: 'freed', id: user._id })
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

/* DELETE /api/admin/tenants/:id – permanently delete a tenant account (payment records are kept) */
router.delete('/tenants/:id', async (req, res) => {
  try {
    const user = await Register.findOneAndDelete({ _id: req.params.id, ...TENANTS })
    if (!user) return res.status(404).json({ message: 'Tenant not found.' })
    notify(req, 'applications:changed', { type: 'deleted', id: req.params.id })
    res.json({ deleted: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

/* PATCH /api/admin/rent-by-type  { roomType, rent } – one rent for every tenant of a room type */
router.patch('/rent-by-type', async (req, res) => {
  try {
    const { roomType } = req.body
    const rent = Number(req.body.rent)
    if (!ROOM_TYPES.includes(roomType) || !Number.isFinite(rent) || rent < 0) {
      return res.status(400).json({ message: 'Choose a room type and enter a valid rent.' })
    }
    const result = await Register.updateMany({ ...TENANTS, roomType }, { $set: { rent } })
    notify(req, 'applications:changed', { type: 'bulk-rent' })
    res.json({ updated: result.modifiedCount })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router