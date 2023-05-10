const { Schema, model } = require('mongoose');
const databaseSchema = require('./database');
const campingUnitSchema = databaseSchema.clone();

const Unauthorized = require('../errors/Unauthorized');
const Booking = require('./booking');
const CampingLodging = require('./campingLodging');

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

campingUnitSchema.statics.getCampingUnits = async function (camping) {
  const CampingUnit = this;
  const lodgings = await CampingLodging.search(['_id'], { camping });
  return await CampingUnit.search(null, { lodging: lodgings });
}

campingUnitSchema.statics.getCampingUnitBooked = async function (camping, startDate, endDate) {
  const bookings = await Booking.getCampingBookings(camping, startDate, endDate);
  return bookings.items.reduce((prev, curr) => [...prev, ...curr.units], []);
}

campingUnitSchema.statics.getAvailableUnits = async function (camping, lodgings, startDate, endDate, page=0, size=0, fields=null) {
  const CampingUnit = this;
  
  const unitsBooked = await CampingUnit.getCampingUnitBooked(camping, startDate, endDate);

  const availableUnits = await CampingUnit.search(fields, { 
    _id: { $nin: unitsBooked },
    lodging: lodgings,
  }, size, page);
  return availableUnits;
}

module.exports = model('CampingUnit', campingUnitSchema, 'camping_units');
