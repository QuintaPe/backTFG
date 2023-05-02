const { model, models } = require("mongoose");

const databaseSchema = require('./database');
const UserSchema = databaseSchema.clone();
UserSchema.add({
  email: { type: String, required: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'manager', 'user'] },
  lang: { type: String, required: true },
  attributes: { 
    avatar: { type: Object },
    firstname: { type: String, required: function() { return this.role === "user"; } },
    lastname: { type: String, required: function() { return this.role === "user"; } },
    birthDate: { type: Date, required: function() { return this.role === "user"; } },
    phone: { type: String, required: function() { return this.role === "user"; } },

    // Manager
    camping: { type: String },
  },
});

UserSchema.path('email').validate(async (email) => {
  const countEmails = await models.User.countDocuments({ email });
  return !countEmails;
}, 'Email already exists');

module.exports = model('User', UserSchema);
