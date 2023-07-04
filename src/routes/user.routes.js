const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user.controller');
const bookingCtrl = require('../controllers/booking.controller');

// CRUD de Usuarios
router.get('/', userCtrl.getUsers);
router.get('/:id', userCtrl.getUser);
router.put('/:id', userCtrl.editUser);
router.delete('/:id', userCtrl.deleteUser);

router.get('/:id/bookings', bookingCtrl.getUserBookings);

module.exports = router;
