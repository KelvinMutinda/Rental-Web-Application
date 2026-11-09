const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  tenant:     { type: mongoose.Schema.Types.ObjectId, ref: 'register', required: true, index: true },
  month:      { type: String, required: true },            
  amount:     { type: Number, required: true, min: 1 },
  phone:      { type: String, required: true },            
  status:     { type: String, enum: ['pending', 'confirmed', 'failed'], default: 'pending' },
  checkoutRequestId: { type: String, index: true, unique: true, sparse: true },
  merchantRequestId: String,
  mpesaReceipt: String,
  resultDesc:  String,
  paidAt:      Date,
}, { timestamps: true });

module.exports = mongoose.model('payment', paymentSchema);
