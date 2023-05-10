const Booking = require('../models/booking');
const campingLodging = require('../models/campingLodging');
const Unauthorized = require('../errors/Unauthorized');
const { arrayToObj, daysBetweenDates } = require('../utils/functions');
const campingUnit = require('../models/campingUnit');

const bookingController = {};

bookingController.createBooking = async (req, res, next) => {
  const { id } = req.params;
  const { startDate, endDate, lodgings, user, paymentMethod } = req.body;
  try {
    const booking = new Booking({ camping: id, startDate, endDate, paymentMethod, user: req.user._id });
    const totalDays = daysBetweenDates(endDate, startDate);
    let totalCost = 0;
    let units = [];
    
    let availableLodgings = await campingLodging.getAvailableLodgings(id, startDate, endDate);
    availableLodgings = arrayToObj(availableLodgings.items);
    for (const lodging of Object.keys(lodgings)) {
      if (!availableLodgings[lodging] || availableLodgings[lodging].availables < lodgings[lodging] ) {
        throw new Unauthorized();
      }
      units.push(campingUnit.getAvailableUnits(id, [lodging], startDate, endDate, 0, lodgings[lodging], ['_id']));
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
  const { camping, startDate, endDate } = req.body;

  try {
    const bookings = await Booking.getCampingBookings(camping, startDate, endDate);
    res.status(201).json({ bookings });
  } catch (error) {
    next(error);
  }
};

module.exports = bookingController;