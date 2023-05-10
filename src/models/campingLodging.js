const { Schema, model } = require('mongoose');
const databaseSchema = require('./database');
const campingLodgingSchema = databaseSchema.clone();
const CampingUnit = require('./campingUnit');
const Unauthorized = require('../errors/Unauthorized');

campingLodgingSchema.add({
  camping: { type: Schema.Types.ObjectId, ref: 'Camping' },
  type: { type: String, enum: ['campsite', 'bungalow', 'other'], required: true }, 
  name: { type: String, required: true },
  size: { type: String, required: function() { return this.type === 'campsite' } },
  capacity: { type: Number, min: 0 , required: true },
  beds: {
    single: { type: Number, min: 0, required:  ({ type }) => type !== 'campsite' },
    double: { type: Number, min: 0, required: ({ type }) => type !== 'campsite' },  
    bunk: { type: Number, min: 0, required: ({ type }) => type !== 'campsite' },  
  },
  bathroom: {
    private: { type: Boolean, default: false },
    showers: { type: Number, min: 0 , required: true },
    toilets: { type: Number, min: 0 , required: true },  
  },
  notes: { type: String },
  feePerNight: { type: Number, min: 0 , required: true },
});

campingLodgingSchema.virtual('units');
campingLodgingSchema.virtual('availables');

campingLodgingSchema.statics.createOrUpdate = async function (camping, lodgings, session) {
  const CampingLodging = this;
  const campingLodgingsOperations = [];
  const CampingLodgingIds = [];

  for (let lodging of lodgings) {
    if (!lodging._id || lodging._id.startsWith('new')) {
      delete lodging._id;
      const campingLodging = new CampingLodging(lodging);
      lodging._id = campingLodging._id.toString();
      campingLodging.camping = camping;
      campingLodgingsOperations.push( {
        insertOne: { document: campingLodging }
      });
      CampingLodgingIds.push(campingLodging._id);
    } else {
      if (!camping.equals(lodging.camping)) {
        throw new Unauthorized();
      }
      campingLodgingsOperations.push({
        updateOne: { 
          filter: { _id: lodging._id },
          update: { $set: lodging }
        }
      });
      CampingLodgingIds.push(lodging._id);
    }
    await CampingUnit.createOrUpdate(lodging._id, lodging.units, session)
  };
  
  campingLodgingsOperations.push({
    deleteMany: { filter: { _id: { $nin: CampingLodgingIds }, camping } },
  });
  
  if (campingLodgingsOperations.length > 0) {
    await CampingLodging.bulkWrite(campingLodgingsOperations, { session });
    await CampingUnit.deleteMany(
      { lodging: { $in: await CampingLodging.find({ _id: { $nin: CampingLodgingIds }, camping }, '_id') }},
      { session }
    );
  }
}

campingLodgingSchema.statics.getAvailableLodgings = async function (camping, startDate, endDate) {
const CampingLodging = this;
  try {
    const lodgings = await CampingLodging.search(['_id'], { camping });
    const availableUnits = await CampingUnit.getAvailableUnits(camping, lodgings.items, startDate, endDate);
    const campingLodgingAvailables = {}
    availableUnits.items.forEach(element => {
      campingLodgingAvailables[element.lodging] = campingLodgingAvailables[element.lodging] 
        ? campingLodgingAvailables[element.lodging] + 1 : 1
    });
    const campingLodgings = await CampingLodging.search(null, { _id: { $in: Object.keys(campingLodgingAvailables) } });
    campingLodgings.items = campingLodgings.items.map(lodging => {
      lodging.availables = campingLodgingAvailables[lodging._id];
      return lodging;
    })
    console.log(availableUnits)

    return campingLodgings;
  } catch (err) {
    throw err;
  }
}

module.exports = model('CampingLodging', campingLodgingSchema, 'camping_lodgings');

