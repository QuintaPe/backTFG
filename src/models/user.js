const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    rol: { type: Number, required: true },

    //Grupo
    groupName: { type: String },

    //Admin-Gestor
    name: { type: String },
    lastName: { type: String },
    camping: { type: String },
    birthDate: {type: Date},

    //Ambos
    city: { type: String },
    address: { type: String },
    zip: { type: String },
    email: { type: String },
    phone: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
