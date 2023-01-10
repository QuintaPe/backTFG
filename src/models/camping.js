const mongoose = require("mongoose");
const { Schema } = mongoose;

const campingSchema = new Schema(
    {   
        name: { type: String, required: true },
        description: { type: String, required: true },
        images: [{ type: String }],
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        price: { type: Number, required: true },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

module.exports = mongoose.model("Camping", campingSchema);
