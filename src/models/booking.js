const { Schema, model } = require('mongoose');
const databaseSchema = require('./database');

const BookingSchema = databaseSchema.clone();

BookingSchema.add({
  camping: { type: Schema.Types.ObjectId, ref: 'Camping', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  units: { type: [Schema.Types.ObjectId], ref: 'CampingUnit', required: true },
  totalCost: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
});

BookingSchema.statics.getCampingBookings = async function (camping, startDate, endDate) {
  const Booking = this;  
  const filters = {
    camping,
    startDate: { $gte: startDate },
    endDate: { $lte: endDate }
  }

  return Booking.search(null, filters, 0);
}

module.exports = model('Booking', BookingSchema);
