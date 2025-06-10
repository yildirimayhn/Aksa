const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/add', paymentController.addPayment);

module.exports = router;