const Booking = require('../models/booking');
const Camping = require('../models/camping');
const User = require('../models/user');
const CampingUnit = require('../models/campingUnit');
const CampingLodging = require('../models/campingLodging');
const i18n = require('i18n');
const Unauthorized = require('../errors/Unauthorized');
const HandledError = require('../errors/HandledError');
const { arrayToObj, daysBetweenDates } = require('../helpers/functions');
const { formatDate } = require('../helpers/functions');
const sendEmail = require('../mailer');

const bookingController = {};

bookingController.createBooking = async (req, res, next) => {
  const { id } = req.params;
  const { entryDate, exitDate, lodgings, manager, paymentMethod } = req.body;
  try {
    const booking = new Booking({ camping: id, entryDate, exitDate, manager, paymentMethod, status: "pending", user: req.user._id });
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

    const camping = await Camping.findById(id);
    const receiver = await User.findById(camping.owner);

    i18n.setLocale(receiver.lang);
    await sendEmail(
      receiver, 
      i18n.__('newBookingSubject'),
      i18n.__mf('newBookingMessage', {
        camping: camping.name,
        entryDate: formatDate(booking.entryDate),
        exitDate: formatDate(booking.exitDate),
      }),
    );

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

bookingController.getUserBookings = async (req, res, next) => {
  const { id } = req.params;
  const opts = req.query.opts;
  opts.populate = ['user', 'units', 'camping']

  try {
    if (id !== req.user._id) {
      throw new Unauthorized();
    }

    const bookings = await Booking.getUserBookings(req.user.role === 'admin' ? null : id, opts);
    
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

bookingController.changeBookingStatus = async (req, res, next) => {
  const { id, booking, status } = req.params;
  try {
    const bookingToEdit = await Booking.findOne({ _id: booking, camping: id }).populate('camping');
    
    if (!bookingToEdit) {
      throw new HandledError('booking_not_found', 'Booking not found')
    };
    
    const isOwner = bookingToEdit.camping.owner.equals(req.user._id);
    const isUser = bookingToEdit.user.equals(req.user._id);
    let canEdit = false;
    let receiver = false;
    
    if (isOwner) {
      canEdit = bookingToEdit.status === 'pending'
        ? ['accepted', 'rejected'].includes(status)
        : status === 'cancelled';
      receiver = await User.findById(bookingToEdit.user);
    } else if (isUser) {
      canEdit = status === 'cancelled' && ['accepted', 'pending'].includes(bookingToEdit.status);
      receiver = await User.findById(bookingToEdit.camping.owner);
    }

    if (!canEdit) {
      throw new Unauthorized();
    };

    i18n.setLocale(receiver.lang);
    await sendEmail(
      receiver,
      i18n.__('changeBookingStatusSubject'),
      i18n.__mf('changeBookingStatusMessage', {
        camping: bookingToEdit.camping.name,
        entryDate: formatDate(bookingToEdit.entryDate),
        exitDate: formatDate(bookingToEdit.exitDate),
        status: i18n.__(status)
      }),
    );

    bookingToEdit.status = status;
    await bookingToEdit.save();
    res.status(200).json(bookingToEdit);
  } catch (error) {
    next(error);
  }
};

module.exports = bookingController;