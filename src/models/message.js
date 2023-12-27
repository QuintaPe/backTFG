import { model, Schema } from 'mongoose';
import databaseSchema from './database.js';

const MessageSchema = databaseSchema.clone();
MessageSchema.add({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  message: String,
});

export default model('Message', MessageSchema);
