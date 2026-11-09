const mongoose = require('mongoose');

const registerSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  phoneno:   { type: String, required: true, trim: true },
  regno:     { type: String, required: true, unique: true, trim: true },
  course:    { type: String, required: true, trim: true },
  password:  { type: String, required: true, minlength: 6 },
  role:      { type: String, enum: ['admin', 'tenant'], default: 'tenant' },


  roomType:    { type: String, enum: ['Single room', '2 Bedroom', 'Bedsitter'] },
  parentPhone: { type: String, trim: true },

  status:     { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  roomNumber: { type: String, trim: true },   // set by admin on approval
  rent:       { type: Number, min: 0 },       // monthly rent set by admin on approval
  dueDay:     { type: Number, min: 1, max: 28, default: 5 },
  approvedAt: Date,
  rejectReason: String,
}, { timestamps: true });

module.exports = mongoose.model('register', registerSchema);
