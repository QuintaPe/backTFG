const mongoose = require('mongoose');

const Camping = require('../models/camping');
const CampingLodging = require('../models/campingLodging');
const CampingUnit = require('../models/campingUnit');
const NotFound = require('../errors/NotFound');

const campingController = {}

// Get all campings
campingController.getCampings = async (req, res, next) => {
  const { page, size, search, filters, sort } = req.body;

  const auxFilters = {}
  if (req.user.role !== 'admin') {
    auxFilters.owner = req.user._id;
  }

  const response = await Camping.search(null, auxFilters, size, page, sort ?? '-createdAt');
  res.json(response);
};

// Get single camping
campingController.getCamping = async (req, res, next) => {
  const id = req.params.id;
  try {
    const camping = await Camping.findById(id).populate('images').lean();
    if(!camping) {
      throw NotFound(id, 'Camping');
    }
    res.status(200).json(camping);
  } catch (error) {
    res.status(500).json({ error })
  }
};

// Get single camping with his lodgings and their units
campingController.getFullCamping = async (req, res, next) => {
  const id = req.params.id;
  try {
    const camping = await Camping.findById(id).populate('images').lean();
    if(!camping) {
      return res.status(404).json({ message: "Camping not found" });
    }
    const lodgings = await CampingLodging.find({ camping: camping._id });
    const lodgingsWithUnits = lodgings.map(async lodging => {
      lodging.units = await CampingUnit.find({ lodging: lodging._id });
      return lodging;
    });
    camping.lodgings = await Promise.all(lodgingsWithUnits)
    res.status(200).json(camping);
  } catch (error) {
    res.status(500).json({ error })
  }
};

// Create or update a camping
campingController.createCamping = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    delete req.body.owner;
    session.startTransaction();

    const camping = await Camping.createOrUpdate(req.body, req.user._id, session);
    await CampingLodging.createOrUpdate(camping._id, req.body.lodgings, session);
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
      CampingUnit.deleteMany({ lodging: { $in: await CampingLodging.find({ camping: camping._id }) } }),
      CampingLodging.deleteMany({ camping: camping._id })
    ]);
    
    return res.status(200).json({ message: 'Camping deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

module.exports = campingController;