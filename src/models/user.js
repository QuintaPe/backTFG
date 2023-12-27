import Mongoose, { model } from 'mongoose';
import databaseSchema from './database.js';

const UserSchema = databaseSchema.clone();
UserSchema.add({
  email: { type: String, required: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'manager', 'user'] },
  lang: { type: String, required: true },
  attributes: {
    avatar: { type: Object },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    birthDate: { type: Date, required: true },
    phone: { type: String, required: true },
  },
});

UserSchema.path('email').validate(async (email) => {
  const countEmails = await Mongoose.isValidObjectIdmodels.User.countDocuments({ email });
  return !countEmails;
}, 'Email already exists');

export default model('User', UserSchema);
