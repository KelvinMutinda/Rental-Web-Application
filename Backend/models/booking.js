const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tenantName: { type: String, required: true },
    email: String,
    phone: String,
    course: String,
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    decidedAt: Date,
    note: String,
  },
  { timestamps: true }
)

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema)