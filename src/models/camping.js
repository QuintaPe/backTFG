const { Schema, model } = require('mongoose');
const Unauthorized = require('../errors/Unauthorized');
const databaseSchema = require('./database');
const CampingRelation = require('./campingRelation');
const { arrayToObj } = require('../utils/functions');
const campingSchema = databaseSchema.clone();

const location = {
  country: { type: String, required: true },
  community: { type: String, required: true },
  city: { type: String, required: true },
  locality: { type: String, required: true },
  street: { type: String, required: true },
  streetNumber: { type: String, required: true },
  postalCode: { type: String, required: true },
  coords: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
  },
};

const checkTime = {
  from: { type: String, required: true },
  to: { type: String, required: true },
};

const contactInformation = {
  phone: { type: String, required: true },
  email: { type: String, required: true },
};

campingSchema.add({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: location,
  available: { type: Boolean, default: true },
  images: { type: [Schema.Types.ObjectId], ref: 'Document' }, // required: true
  amenities: { type: String },
  rules: { type: String },
  nearestLocations: { type: String },
  checkInTime: checkTime,
  checkOutTime: checkTime,
  contactInformation: contactInformation,
  bail: { type: Number, min: 0 },
  cancellationPolicy: { type: String },
  paymentMethods: [{ type: String }],
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
});

campingSchema.virtual('lodgings');
campingSchema.index({ 'location.coords': '2dsphere' });

campingSchema.statics.createOrUpdate = async function (data, user, session) {
  const Camping = this;
  const { _id, ...otherData } = data;

  const camping = _id
    ? (await Camping.findById(_id)).set(otherData)
    : new Camping({ ...otherData, owner: user });

  if (_id && !camping.owner.equals(user)) {
    throw new Unauthorized();
  }
  await camping.save({ session });
  return camping;
};

campingSchema.statics.getCampings = async function (page, size, user, opts) {
  const Camping = this;

  const filters = [
    {
      $lookup: {
        from: 'camping_lodgings',
        localField: '_id',
        foreignField: 'camping',
        as: 'lodgings',
      },
    },
    {
      $lookup: {
        from: 'camping_units',
        localField: 'lodgings._id',
        foreignField: 'lodging',
        as: 'units',
      },
    },
    {
      $lookup: {
        from: 'camping_relations',
        localField: '_id',
        foreignField: 'camping',
        as: 'relations',
      },
    },
    {
      $addFields: {
        ratings: {
          averageRatings: {
            $avg: '$relations.review.rating',
          },
          amount: {
            $size: '$relations.review.rating',
          },
        },
      },
    },
    {
      $addFields: {
        lodgings: {
          $map: {
            input: '$lodgings',
            as: 'lodging',
            in: {
              $mergeObjects: [
                '$$lodging',
                {
                  units: {
                    $filter: {
                      input: '$units',
                      as: 'unit',
                      cond: { $eq: ['$$unit.lodging', '$$lodging._id'] },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        totalCapacity: {
          $sum: {
            $map: {
              input: '$lodgings',
              in: { $multiply: ['$$this.capacity', { $size: '$$this.units' }] },
            },
          },
        },
      },
    },
  ];

  if (opts.lat && opts.lng) {
    filters.unshift({
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [opts.lat, opts.lng],
        },
        distanceField: 'distance',
        spherical: true,
        maxDistance: 10000,
        query: {},
        includeLocs: 'location.coords',
        distanceMultiplier: 0.001,
      },
    });
  }

  if (opts.entryDate && opts.exitDate) {
    filters.push({
      $lookup: {
        from: 'bookings',
        let: { campingId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$camping', '$$campingId'] },
                  { $lte: ['$entryDate', new Date(opts.exitDate)] },
                  { $gte: ['$exitDate', new Date(opts.entryDate)] },
                ],
              },
            },
          },
          {
            $lookup: {
              from: 'camping_units',
              localField: 'units',
              foreignField: '_id',
              as: 'unitsInfo',
            },
          },
          {
            $unwind: {
              path: '$unitsInfo',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: 'camping_lodgings',
              localField: 'unitsInfo.lodging',
              foreignField: '_id',
              as: 'lodgingInfo',
            },
          },
          {
            $unwind: {
              path: '$lodgingInfo',
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
        as: 'bookingInfo',
      },
    }, 
    {
      $addFields: {
        availableCapacity: {
          $subtract: [
            '$totalCapacity',
            { $sum: { $ifNull: ['$bookingInfo.lodgingInfo.capacity', 0] } },
          ],
        },
      },
    });
  }

  if (opts.capacity) {
    filters.push({
      $match: {
        $or: [
          { availableCapacity: { $gte: opts.capacity } },
          { availableCapacity: { $exists: false } },
        ],
      },
    });
  }

  if (opts.campings) {
    filters.push({
      $match: {
        _id: { $in: opts.campings },
      }
    });
  }

  filters.push(
    { $unset: ['units', 'bookingInfo'] },
    { $skip: page * size },
    { $limit: size },
  );

  try {
    let campings = await Camping.aggregate(filters);
  
    if (user) {  
      const auxFilters = {
        camping: campings.map(camping => camping._id),
        user
      }
      let relations = await CampingRelation.search(null, auxFilters);
      relations = arrayToObj(relations.items, 'camping');
      
      campings = campings.map(camping => ({
        ...camping, relation: relations[camping._id] || null,
      }))
    }
    return { items: campings, total: campings.length };
  } catch (err) {
    throw err;
  }

};

module.exports = model('Camping', campingSchema);
