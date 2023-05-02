const { Schema, model } = require('mongoose');
const databaseSchema = require('./database');
const Unauthorized = require('../errors/Unauthorized');
const campingUnitSchema = databaseSchema.clone();

campingUnitSchema.add({
  lodging: { type: Schema.Types.ObjectId, ref: 'CampingLodging', required: true },
  name: { type: String, required: true },
  notes: { type: String },
  disabled: { type: Boolean, default: false },
});

campingUnitSchema.statics.createOrUpdate = async function (lodging, units, session) {
  const CampingUnit = this;
  const campingUnitsOperations = [];
  const campingUnitsIds = [];

  for (let unit of units) {
    if (!unit._id || unit._id.startsWith('new')) {
      delete unit._id;
      const campingUnit = new CampingUnit(unit);
      campingUnit.lodging = lodging;
      campingUnitsOperations.push( {
        insertOne: { document: campingUnit }
      });
      campingUnitsIds.push(campingUnit._id);
    } else {
      if (lodging !== unit.lodging) {
        throw new Unauthorized();
      }
      campingUnitsOperations.push({
        updateOne: { 
          filter: { _id: unit._id },
          update: { $set: unit }},
      });
      campingUnitsIds.push(unit._id);
    }
  }

  campingUnitsOperations.push({
    deleteMany: { filter: { _id: { $nin: campingUnitsIds }, lodging } },
  });
  
  if (campingUnitsOperations.length > 0) {
    await CampingUnit.bulkWrite(campingUnitsOperations, { session });
  }
};


module.exports = model('CampingUnit', campingUnitSchema, 'camping_units');

