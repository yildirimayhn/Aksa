const Payment = require('../models/Payment');

exports.addPayment = async (req, res) => {
  try {
    const { userId, eventId } = req.body;
    let payment = await Payment.findOne({ userId, eventId });
    if (!payment) {
      payment = new Payment({ userId, eventId, paid: true, paidDate: new Date() });
    } else {
      payment.paid = true;
      payment.paidDate = new Date();
    }
    await payment.save();
    res.json({ success: true, payment });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};