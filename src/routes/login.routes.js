const express = require("express");
const router = express.Router();

const loginCtrl = require("../controllers/login.controller");

//Sesiones
router.post('/login', loginCtrl.login);
//router.get('/comprobar-token', loginCtrl.getComprobarToken);
//router.get('/comprobar-token-bool', loginCtrl.getComprobarTokenBool);

module.exports = router;
