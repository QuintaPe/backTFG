const { model, Schema } = require('mongoose');

const databaseSchema = require('./database');
const MessageSchema = databaseSchema.clone();

MessageSchema.add({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  message: String,
});


module.exports = model('Message', MessageSchema);
