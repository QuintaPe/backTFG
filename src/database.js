const mongoose = require("mongoose");
const config = require("./config");

const MONGODB_URI = `mongodb+srv://${config.MONGODB_HOST}/${config.MONGODB_DATABASE}`;

mongoose.set("strictQuery", false);
mongoose.connect(MONGODB_URI)
  .then((db) => console.log("Mongodb is connected to", db.connection.host))
  .catch((err) => console.error(err));
