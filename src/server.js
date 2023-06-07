const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { authMiddleware, errorsMiddleware } = require("./utils/middlewares");

// Initializations
const app = express();

// Settings
app.set("port", process.env.PORT || 3000);


// Middlewares
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use('/api/v1/users', authMiddleware, require('./routes/user.routes'));
app.use('/api/v1/campings', authMiddleware, require('./routes/camping.routes'));
app.use('/api/v1/documents', require('./routes/document.routes'));
app.use('/api/v1/', require('./routes/auth.routes'));


// Error Middleware
app.use(errorsMiddleware);

module.exports = app;
