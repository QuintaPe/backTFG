const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
  camping: { type: Schema.Types.ObjectId, ref: 'Camping', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  guests: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now },
},{timestamps: true});

module.exports = mongoose.model('Booking', BookingSchema);
