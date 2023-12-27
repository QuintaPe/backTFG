import mongoose from 'mongoose';
import Camping from '../models/camping.js';
import CampingUnit from '../models/campingUnit.js';
import CampingLodging from '../models/campingLodging.js';
import CampingRelation from '../models/campingRelation.js';
import { NotFound } from '../errors/NotFound.js';

const campingController = {};

// Get all campings
campingController.getOwnCampings = async (req, res) => {
  const { page, size, filters, sort } = req.query.opts;

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
    const campingIds = await CampingRelation.search(['camping'], { user, favorite: true }, size, page);
    const campings = await Camping.getCampings(page, size, user, { campings: campingIds.items });

    res.json(campings);
  } catch (error) {
    next(error);
  }
};

campingController.getAvailableCampings = async (req, res, ) => {
  const { lat, lng, entryDate, exitDate, capacity } = req.query;
  const { page = 0, size = 10000 } = req.query.opts;
  const user = req.user?.id;

  const campings = await Camping.getCampings(page, size, user, { lat, lng, entryDate, exitDate, capacity })
  res.json(campings);
};

// Get single camping
campingController.getCamping = async (req, res, ) => {
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
campingController.getFullCamping = async (req, res, ) => {
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

export default campingController;
