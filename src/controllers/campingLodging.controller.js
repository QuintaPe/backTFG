const Unauthorized = require('../errors/Unauthorized');
const Camping = require('../models/camping');
const CampingLodging = require('../models/campingLodging');

const campingLodgingController = {};

campingLodgingController.getCampingLodgings = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const camping = await Camping.findById(id);
    if (!camping.owner.equals(req.user._id)) {
      throw new Unauthorized();
    }

    const lodgings = await CampingLodging.search(null, { camping: id });
    res.status(201).json(lodgings);
  } catch (err) {
    next(err);
  }
};

campingLodgingController.getAvailableLodgings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const availableLodgings = await CampingLodging.getAvailableLodgings(id, startDate, endDate);
    res.status(201).json(availableLodgings);
  } catch (err) {
    next(err);
  }
};

module.exports = campingLodgingController;
