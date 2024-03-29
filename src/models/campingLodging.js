import { Schema, model } from 'mongoose';
import databaseSchema from './database.js';
import CampingUnit from './campingUnit.js';
import { Unauthorized } from '../errors/Unauthorized.js';

const campingLodgingSchema = databaseSchema.clone();
campingLodgingSchema.add({
  camping: { type: Schema.Types.ObjectId, ref: 'Camping' },
  type: {
    type: String,
    enum: ['campsite', 'bungalow', 'other'],
    required: true,
  },
  name: { type: String, required: true },
  size: {
    type: String,
    required: function () {
      return this.type === 'campsite';
    },
  },
  capacity: { type: Number, min: 0, required: true },
  beds: {
    single: {
      type: Number,
      min: 0,
      required: ({ type }) => type !== 'campsite',
    },
    double: {
      type: Number,
      min: 0,
      required: ({ type }) => type !== 'campsite',
    },
    bunk: { type: Number, min: 0, required: ({ type }) => type !== 'campsite' },
  },
  bathroom: {
    private: { type: Boolean, default: false },
    showers: { type: Number, min: 0, required: true },
    toilets: { type: Number, min: 0, required: true },
  },
  notes: { type: String },
  feePerNight: { type: Number, min: 0, required: true },
});

campingLodgingSchema.virtual('units');
campingLodgingSchema.virtual('availables');

campingLodgingSchema.statics.createOrUpdate = async function (
  camping,
  lodgings,
  session
) {
  const CampingLodging = this;
  const campingLodgingsOperations = [];
  const CampingLodgingIds = [];

  for (let lodging of lodgings) {
    if (!lodging._id || lodging._id.startsWith('new')) {
      delete lodging._id;
      const campingLodging = new CampingLodging(lodging);
      lodging._id = campingLodging._id.toString();
      campingLodging.camping = camping;
      campingLodgingsOperations.push({
        insertOne: { document: campingLodging },
      });
      CampingLodgingIds.push(campingLodging._id);
    } else {
      if (!camping.equals(lodging.camping)) {
        throw new Unauthorized();
      }
      campingLodgingsOperations.push({
        updateOne: {
          filter: { _id: lodging._id },
          update: { $set: lodging },
        },
      });
      CampingLodgingIds.push(lodging._id);
    }
    await CampingUnit.createOrUpdate(lodging._id, lodging.units, session);
  }

  campingLodgingsOperations.push({
    deleteMany: { filter: { _id: { $nin: CampingLodgingIds }, camping } },
  });

  if (campingLodgingsOperations.length > 0) {
    await CampingLodging.bulkWrite(campingLodgingsOperations, { session });

    await CampingUnit.deleteMany(
      {
        lodging: {
          $in: await CampingLodging.find(
            { _id: { $nin: CampingLodgingIds }, camping },
            '_id'
          ),
        },
      },
      { session }
    );
  }
};

campingLodgingSchema.statics.getAvailableLodgings = async function (
  camping,
  entryDate,
  exitDate,
  opts
) {
  const CampingLodging = this;
  const { page = 0, size = 0, filters = {}, sort = '' } = opts;

  const lodgings = await CampingLodging.search(['_id'], { camping });
  const availableUnits = await CampingUnit.getAvailableUnits(
    camping,
    lodgings.items,
    entryDate,
    exitDate,
    {}
  );
  const campingLodgingAvailables = {};
  availableUnits.items.forEach((element) => {
    campingLodgingAvailables[element.lodging] = (campingLodgingAvailables[element.lodging] || 0) + 1;
  });

  const searchFilters = {
    ...filters,
    _id: { $in: Object.keys(campingLodgingAvailables) },
  };
  const campingLodgings = await CampingLodging.search(
    null,
    searchFilters,
    size,
    page,
    sort
  );
  campingLodgings.items = campingLodgings.items.map((lodging) => {
    lodging.availables = campingLodgingAvailables[lodging._id];
    return lodging;
  });

  return campingLodgings;

};

export default model(
  'CampingLodging',
  campingLodgingSchema,
  'camping_lodgings'
);
