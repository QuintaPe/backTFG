import express from 'express';
import authCtrl from '../controllers/auth.controller.js';

export const authRouter = express.Router();
authRouter.post('/login', authCtrl.login);
authRouter.post('/signup', authCtrl.signup);
authRouter.post('/recovery-password', authCtrl.forgotPassword);
authRouter.post('/recovery-password/:token', authCtrl.resetPassword);
