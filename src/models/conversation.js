const { model, Schema } = require('mongoose');

const databaseSchema = require('./database');
const ConversationSchema = databaseSchema.clone();

const ParticipantSchema = {
  type: {
    type: String,
    enum: ['User', 'Camping'],
    required: true,
  },
  id: {
    type: Schema.Types.ObjectId,
    refPath: 'participants.type',
    required: false,
  },
};

ConversationSchema.add({
  participants: [ParticipantSchema],
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  lastMessageSeen: { type: Map, of: Date },
});


module.exports = model('Conversation', ConversationSchema);
