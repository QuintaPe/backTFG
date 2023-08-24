const mongoose = require('mongoose');

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_HOST}/${process.env.MONGODB_DB}`;

mongoose.set('strictQuery', false);
mongoose
  .connect(MONGODB_URI)
  .then((db) => console.log('Mongodb is connected to', db.connection.host))
  .catch((err) => console.error(err));
