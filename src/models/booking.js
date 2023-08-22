const { Schema, model } = require('mongoose');
const databaseSchema = require('./database');
const CampingRelation = require('./campingRelation');
const { arrayToObj } = require('../utils/functions');

const BookingSchema = databaseSchema.clone();

const manager = {
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
};

BookingSchema.add({
  camping: { type: Schema.Types.ObjectId, ref: 'Camping', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  manager: manager,
  entryDate: { type: Date, required: true },
  exitDate: { type: Date, required: true },
  units: { type: [Schema.Types.ObjectId], ref: 'CampingUnit', required: true },
  totalCost: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled'], required: true },
});

BookingSchema.statics.getCampingBookings = async function (
  camping,
  entryDate,
  exitDate,
  opts
) {
  const Booking = this;
  const { page, size, filters, sort, fields, populate } = opts;

  const searchFilters = { ...filters, camping };

  if (entryDate && exitDate) {
    searchFilters.entryDate = { $lte: exitDate };
    searchFilters.exitDate = { $gte: entryDate }; 
  }

  return Booking.search(
    fields || null,
    searchFilters,
    size,
    page,
    sort,
    populate
  );
};

BookingSchema.statics.getUserBookings = async function (user, opts) {
  const Booking = this;
  const { page, size, filters, sort, fields, populate } = opts;
  if (user) {
    filters.user = user;
  }

  const bookings = await Booking.search(fields || null, filters, size, page, sort, populate, true);
  const relationFilters = {
    camping: bookings.items.map(book => book.camping._id),
    user
  };
  let campingRelations = await CampingRelation.search(['camping', 'favorite', 'review'], relationFilters, 0);
  campingRelations = arrayToObj(campingRelations.items, 'camping');
  bookings.items = bookings.items.map(book => ({ ...book, relation: campingRelations[book.camping._id]}));
  return bookings;
};

module.exports = model('Booking', BookingSchema);
