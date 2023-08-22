const { Schema, model } = require('mongoose');
const databaseSchema = require('./database');
const campingRelationSchema = databaseSchema.clone();

const review = {
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
};

campingRelationSchema.add({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  camping: { type: Schema.Types.ObjectId, ref: 'Camping' },
  favorite: { type: Boolean, default: false },
  review: {
    type: review,
    default: null,
  }
});

module.exports = model('CampingRelation', campingRelationSchema, 'camping_relations');
