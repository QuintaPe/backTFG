const express = require('express');
const router = express.Router();

const authCtrl = require('../controllers/auth.controller');

//Sesiones
router.post('/login', authCtrl.login);
router.post('/signup', authCtrl.signup);
router.post('/recovery-password', authCtrl.forgotPassword);
router.post('/recovery-password/:token', authCtrl.resetPassword);

module.exports = router;
