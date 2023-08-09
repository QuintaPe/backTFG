const CampingLodging = require('../models/campingLodging');
const campingLodgingController = {};

campingLodgingController.getCampingLodgings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lodgings = await CampingLodging.search(null, { camping: id });
    res.status(201).json(lodgings);
  } catch (err) {
    next(err);
  }
};

campingLodgingController.getAvailableLodgings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { entryDate, exitDate, opts } = req.query;

    const availableLodgings = await CampingLodging.getAvailableLodgings(
      id,
      entryDate,
      exitDate,
      opts
    );
    res.status(201).json(availableLodgings);
  } catch (err) {
    next(err);
  }
};

module.exports = campingLodgingController;
