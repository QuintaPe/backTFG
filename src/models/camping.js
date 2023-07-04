const { Schema, model } = require('mongoose');
const Unauthorized = require('../errors/Unauthorized');
const databaseSchema = require('./database');
const campingSchema = databaseSchema.clone();

const location = {
  country: { type: String, required: true },
  community: { type: String, required: true },
  city: { type: String, required: true },
  locality: { type: String, required: true },
  street: { type: String, required: true },
  streetNumber: { type: String, required: true },
  postalCode: { type: String, required: true },
  coords: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
  },
};

const checkTime = {
  from: { type: String, required: true },
  to: { type: String, required: true },
};

const ratings = {
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
};

const contactInformation = {
  phone: { type: String, required: true },
  email: { type: String, required: true },
};

campingSchema.add({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: location,
  available: { type: Boolean, default: true },
  images: { type: [Schema.Types.ObjectId], ref: 'Document' }, // required: true
  amenities: { type: String },
  rules: { type: String },
  nearestLocations: { type: String },
  checkInTime: checkTime,
  checkOutTime: checkTime,
  ratings: [ratings],
  contactInformation: contactInformation,
  bail: { type: Number, min: 0 },
  cancellationPolicy: { type: String },
  paymentMethods: [{ type: String }],
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
});

campingSchema.virtual('lodgings');
campingSchema.index({ 'location.coords': '2dsphere' });

campingSchema.statics.createOrUpdate = async function (data, user, session) {
  const Camping = this;
  const { _id, ...otherData } = data;

  const camping = _id
    ? (await Camping.findById(_id)).set(otherData)
    : new Camping({ ...otherData, owner: user });

  if (_id && !camping.owner.equals(user)) {
    throw new Unauthorized();
  }
  await camping.save({ session });
  return camping;
};

module.exports = model('Camping', campingSchema);
