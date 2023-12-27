import { Schema, model } from 'mongoose';
import databaseSchema from './database.js';

const campingRelationSchema = databaseSchema.clone();
const review = {
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
};

campingRelationSchema.add({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  camping: { type: Schema.Types.ObjectId, ref: 'Camping' },
  favorite: { type: Boolean, default: false },
  review: { type: review, default: null }
});

export default model('CampingRelation', campingRelationSchema, 'camping_relations');
