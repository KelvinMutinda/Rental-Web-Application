const express = require('express')
const Room = require('../models/Room')
const Booking = require('../models/Booking')
const { auth, adminOnly } = require('../middleware/auth')

const router = express.Router()
router.use(auth, adminOnly)

const notify = (req, event, payload) => req.app.get('notifyAdmins')(event, payload)

// Overview numbers
router.get('/stats', async (req, res) => {
  try {
    const [rooms, pending, approved] = await Promise.all([
      Room.find(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'approved' }),
    ])
    const occupied = rooms.filter((r) => r.status === 'occupied')
    res.json({
      totalRooms: rooms.length,
      available: rooms.filter((r) => r.status === 'available').length,
      occupied: occupied.length,
      maintenance: rooms.filter((r) => r.status === 'maintenance').length,
      pending,
      approved,
      monthlyRentRoll: occupied.reduce((sum, r) => sum + r.price, 0),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Rooms
router.get('/rooms', async (req, res) => {
  res.json(await Room.find().sort({ number: 1 }))
})

router.post('/rooms', async (req, res) => {
  try {
    const room = await Room.create(req.body)
    notify(req, 'rooms:changed')
    res.status(201).json(room)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.patch('/rooms/:id', async (req, res) => {
  const update = {}
  ;['price', 'status', 'type'].forEach((k) => {
    if (req.body[k] !== undefined) update[k] = req.body[k]
  })
  if (update.price !== undefined && (isNaN(update.price) || update.price < 0)) {
    return res.status(400).json({ message: 'Enter a valid price.' })
  }
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
    if (!room) return res.status(404).json({ message: 'Room not found.' })
    notify(req, 'rooms:changed')
    res.json(room)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// One price for every room of a type
router.patch('/rooms-price/by-type', async (req, res) => {
  const { type, price } = req.body
  if (!type || isNaN(price) || price < 0) {
    return res.status(400).json({ message: 'Choose a room type and a valid price.' })
  }
  const result = await Room.updateMany({ type }, { price })
  notify(req, 'rooms:changed')
  res.json({ updated: result.modifiedCount })
})

// Bookings
router.get('/bookings', async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {}
  res.json(await Booking.find(filter).populate('room', 'number type price').sort({ createdAt: -1 }))
})

router.patch('/bookings/:id/approve', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking || booking.status !== 'pending') {
      return res.status(400).json({ message: 'This request was already handled.' })
    }
    // Atomic: succeeds only if the room is still available
    const room = await Room.findOneAndUpdate(
      { _id: booking.room, status: 'available' },
      { status: 'occupied', tenant: booking.tenant },
      { new: true }
    )
    if (!room) return res.status(409).json({ message: 'Room is no longer available.' })

    booking.status = 'approved'
    booking.decidedAt = new Date()
    await booking.save()

    await Booking.updateMany(
      { room: room._id, status: 'pending' },
      { status: 'rejected', decidedAt: new Date(), note: 'Room was allocated to another tenant.' }
    )

    notify(req, 'bookings:changed', { type: 'approved', id: booking._id })
    notify(req, 'rooms:changed')
    res.json(booking)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.patch('/bookings/:id/reject', async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      { status: 'rejected', decidedAt: new Date(), note: req.body?.note || '' },
      { new: true }
    )
    if (!booking) return res.status(400).json({ message: 'This request was already handled.' })
    notify(req, 'bookings:changed', { type: 'rejected', id: booking._id })
    res.json(booking)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router