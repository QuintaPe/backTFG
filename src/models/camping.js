const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const databaseSchema = require('./database');
const campingSchema = databaseSchema.clone();
campingSchema.add({
  image: { type: String },
  name: { type: String}, // required: true
  description: { type: String}, // required: true
  // location: {
  //   type: { type: String, enum: ['Point']}, // required: true
  //   coordinates: { type: [Number]}, // required: true
  // },
  available: { type: Boolean, default: true },
  images: [{ type: String }],
  amenities: [{ type: String }],
  ratings: [{ 
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String }
  }],
  maximumOccupancy: { type: Number}, // required: true
  activities: [{ type: String }],
  rules: [{ type: String }],
  fees: { type: Number}, // required: true
  nearestAttractions: [{ type: String }],
  checkInTime: { type: String}, // required: true
  checkOutTime: { type: String}, // required: true
  cancellationPolicy: { type: String}, // required: true
  contactInformation: { 
    phone: { type: String}, // required: true
    email: { type: String}, // required: true  
  },
  paymentMethods: [{ type: String }],
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  reservedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

campingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Camping', campingSchema);

