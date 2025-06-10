const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  paid: { type: Boolean, default: false },
  paidDate: { type: Date }
});

module.exports = mongoose.model('Payment', PaymentSchema);