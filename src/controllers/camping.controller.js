const mongoose = require('mongoose');

const Camping = require('../models/camping');
const CampingLodging = require('../models/campingLodging');
const CampingUnit = require('../models/campingUnit');
const CampingRelation = require('../models/campingRelation');
const NotFound = require('../errors/NotFound');
const { arrayToObj } = require('../utils/functions');

const campingController = {};

// Get all campings
campingController.getOwnCampings = async (req, res, next) => {
  const { page, size, search, filters, sort } = req.query.opts;

  const auxFilters = { ...filters };
  if (req.user.role !== 'admin') {
    auxFilters.owner = req.user._id;
  }
  const response = await Camping.search(null, auxFilters, size, page, sort);
  res.json(response);
};

campingController.getFavoriteCampings = async (req, res, next) => {
  const { page, size } = req.query.opts;
  const user = req.user._id;

  try {
    const favoriteCampings = await CampingRelation.aggregate([
      { $match: { user: mongoose.Types.ObjectId(user), favorite: true } },
      {
        $lookup: {
          from: 'campings',
          localField: 'camping',
          foreignField: '_id',
          as: 'relation',
        },
      },
      { $skip: page * size },
      { $limit: size },
    ]);
    
    const response = favoriteCampings.map(camping => ({
      ...camping.relation[0],
      relation: camping,
    }));

    res.json({ items: response, total: response.length });
  } catch (error) {
    next(error);
  }
};

campingController.getAvailableCampings = async (req, res, next) => {
  const { lat, lng, entryDate, exitDate, capacity } = req.query;
  const { page = 0, size = 10000 } = req.query.opts;

  Camping.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lat, lng],
        },
        distanceField: 'distance',
        spherical: true,
        maxDistance: 10000,
        query: {},
        includeLocs: 'location',
        distanceMultiplier: 0.001,
      },
    },
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
              input: "$lodgings",
              in: { $multiply: ["$$this.capacity", { $size: "$$this.units" }] }
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: 'bookings',
        let: { campingId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$camping', '$$campingId'] },
                  { $lte: ['$entryDate', new Date(exitDate)] },
                  { $gte: ['$exitDate', new Date(entryDate)] },
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
    },
    { $unset: [ "units", "bookingInfo"] },
    { $skip: page * size },
    { $limit: size },
  ])
    .then(async (campings) => {
      if (req.user?._id) {  
        const filters = {
          camping: campings.map(camping => camping._id),
          user: req.user._id,
        }
        let relations = await CampingRelation.search(null, filters);
        relations = arrayToObj(relations.items, 'camping');
        
        campings = campings.map(camping => ({
          ...camping, relation: relations[camping._id] || null,
        }))
      }
      res.json({ items: campings, total: campings.length });
    })
    .catch((error) => {
      next(error);
    });

  // const response = await Camping.search(null, auxFilters, size, page, sort);
  // res.json(results);
};

// Get single camping
campingController.getCamping = async (req, res, next) => {
  const id = req.params.id;
  try {
    const camping = await Camping.findById(id).populate('images').lean();
    if (!camping) {
      throw NotFound(id, 'Camping');
    }
    res.status(200).json(camping);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Get single camping with his lodgings and their units
campingController.getFullCamping = async (req, res, next) => {
  const id = req.params.id;
  try {
    const camping = await Camping.findById(id).populate('images').lean();
    if (!camping) {
      return res.status(404).json({ message: 'Camping not found' });
    }
    const lodgings = await CampingLodging.find({ camping: camping._id });
    const lodgingsWithUnits = lodgings.map(async (lodging) => {
      lodging.units = await CampingUnit.find({ lodging: lodging._id });
      return lodging;
    });
    camping.lodgings = await Promise.all(lodgingsWithUnits);
    res.status(200).json(camping);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Create or update a camping
campingController.createCamping = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    delete req.body.owner;
    session.startTransaction();

    const camping = await Camping.createOrUpdate(
      req.body,
      req.user._id,
      session
    );

    await CampingLodging.createOrUpdate(
      camping._id,
      req.body.lodgings,
      session
    );
    await session.commitTransaction();

    res.status(201).json({ camping });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  }
  session.endSession();
};

// Delete a Camping
campingController.deleteCamping = async (req, res, next) => {
  try {
    const camping = await Camping.findByIdAndDelete(req.params.id).lean();
    if (!camping) {
      return res.status(404).json({ message: 'Camping not found' });
    }

    await Promise.all([
      CampingUnit.deleteMany({
        lodging: { $in: await CampingLodging.find({ camping: camping._id }) },
      }),
      CampingLodging.deleteMany({ camping: camping._id }),
    ]);

    return res.status(200).json({ message: 'Camping deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

module.exports = campingController;
