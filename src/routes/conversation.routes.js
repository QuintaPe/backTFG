const express = require('express');
const router = express.Router();

const messageCtrl = require('../controllers/message.controller');

// CRUD de Usuarios
router.get('/', messageCtrl.getConversations);
router.post('/', messageCtrl.createConversation);
router.get('/:id', messageCtrl.getConversation);
router.post('/:id', messageCtrl.sendMessage);


module.exports = router;
