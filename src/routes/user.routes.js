import express from 'express';
import userCtrl from '../controllers/user.controller.js';
import bookingCtrl from '../controllers/booking.controller.js';

export const userRouter = express.Router();

// CRUD de Usuarios
userRouter.get('/', userCtrl.getUsers);
userRouter.get('/:id', userCtrl.getUser);
userRouter.put('/:id', userCtrl.editUser);
userRouter.delete('/:id', userCtrl.deleteUser);

userRouter.get('/:id/bookings', bookingCtrl.getUserBookings);