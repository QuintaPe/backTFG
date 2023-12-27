import express from 'express';
import messageCtrl from '../controllers/message.controller.js';

export const conversationRouter = express.Router();
conversationRouter.get('/', messageCtrl.getConversations);
conversationRouter.post('/', messageCtrl.createConversation);
conversationRouter.get('/:id', messageCtrl.getConversation);
conversationRouter.post('/:id', messageCtrl.sendMessage);
