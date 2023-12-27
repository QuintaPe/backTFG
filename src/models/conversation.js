import { model, Schema } from 'mongoose';
import databaseSchema from './database.js';

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
  lastMessageSeen: { type: Map, of: Date, default: {} },
  subject: String,
  status: {
    type: String,
    enum: ['pending', 'opened', 'closed'],
    default: 'pending',
  },
});


export default model('Conversation', ConversationSchema);
