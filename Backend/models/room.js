const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, unique: true }, // e.g. "A-04"
    type: { type: String, enum: ['Single', 'Double', 'Bedsitter'], default: 'Single' },
    price: { type: Number, required: true, min: 0 }, // monthly rent in KES
    status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
)

module.exports = mongoose.models.Room || mongoose.model('Room', roomSchema)