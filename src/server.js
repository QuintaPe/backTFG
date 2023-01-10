const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
require('./database');

// Initializations
const app = express();


// Settings
app.set("port", process.env.PORT || 3000);


// Middlewares
app.use(cors({origin: 'http://localhost:4200'}));
app.use(morgan("dev"));
app.use(express.json());


// Routes
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/campings', require('./routes/camping.routes'));
app.use('/api', require('./routes/login.routes'));



// Static files



module.exports = app;
