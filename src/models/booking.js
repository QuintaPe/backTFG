const { Schema, model } = require('mongoose');
const databaseSchema = require('./database');

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
    searchFilters.entryDate = { $gte: entryDate };
    searchFilters.exitDate = { $lte: exitDate };
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

  return Booking.search(fields || null, filters, size, page, sort, populate);
};

module.exports = model('Booking', BookingSchema);
