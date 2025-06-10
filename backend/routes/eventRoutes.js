const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/', eventController.getAllEvents);
router.post('/', eventController.createEvent);
router.get('/:id', eventController.getEventById);
router.post('/:id/join', eventController.joinEvent);
router.post('/:id/cancel', eventController.cancelParticipation);

module.exports = router;
