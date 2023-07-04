const { Schema, model } = require('mongoose');
const databaseSchema = require('./database');
const campingRelationSchema = databaseSchema.clone();


campingRelationSchema.add({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  camping: { type: Schema.Types.ObjectId, ref: 'Camping' },
  favorite: { type: Boolean, default: false },
  rating: { type: Object, default: false },
});

module.exports = model('CampingRelation', campingRelationSchema, 'camping_relations');
