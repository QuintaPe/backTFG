const Booking = require('../models/booking');
const Camping = require('../models/camping');
const CampingUnit = require('../models/campingUnit');
const CampingLodging = require('../models/campingLodging');
const Unauthorized = require('../errors/Unauthorized');
const { arrayToObj, daysBetweenDates } = require('../utils/functions');

const bookingController = {};

bookingController.createBooking = async (req, res, next) => {
  const { id } = req.params;
  const { entryDate, exitDate, lodgings, manager, paymentMethod } = req.body;
  try {
    const booking = new Booking({ camping: id, entryDate, exitDate, manager, paymentMethod, user: req.user._id });
    const totalDays = daysBetweenDates(exitDate, entryDate);
    let totalCost = 0;
    let units = [];
    
    let availableLodgings = await CampingLodging.getAvailableLodgings(id, entryDate, exitDate, {});
    availableLodgings = arrayToObj(availableLodgings.items);
    for (const lodging of Object.keys(lodgings)) {
      if (!availableLodgings[lodging] || availableLodgings[lodging].availables < lodgings[lodging] ) {
        throw new Unauthorized();
      }
      units.push(CampingUnit.getAvailableUnits(id, [lodging], entryDate, exitDate, { 
        size: lodgings[lodging], fields: ['_id'] }));
      totalCost += totalDays * availableLodgings[lodging].feePerNight * lodgings[lodging]
      
    };
    units = await Promise.all(units);
    booking.units = units.flatMap(unit => unit.items);
    booking.totalCost = totalCost;
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};


bookingController.getCampingBookings = async (req, res, next) => {
  const { id } = req.params;
  const { page, size, search, filters, sort } = req.query;
  const opts = { page, size, search, filters, sort, populate: [
    { path: 'user', select: 'attributes.firstname attributes.lastname' },
    { path: 'units', select: 'name' },
  ] };

  try {
    const camping = await Camping.findById(id);
    if (!camping || !camping.owner.equals(req.user._id)) {
      throw new Unauthorized();
    }
    const bookings = await Booking.getCampingBookings(id, null, null, opts);
    res.status(201).json(bookings);
  } catch (error) {
    next(error);
  }
};

bookingController.deleteCampingBooking = async (req, res, next) => {
  const { id, booking } = req.params;
  try {
    const bookingToRemove = await Booking.findOne({ _id: booking, camping: id }).populate('camping');

    if (!bookingToRemove || !bookingToRemove.camping.owner.equals(req.user._id)) {
      throw new Unauthorized();
    }

    await Booking.findByIdAndRemove(booking);
    res.status(200).json({ deleted: booking });
  } catch (error) {
    next(error);
  }
};

module.exports = bookingController;