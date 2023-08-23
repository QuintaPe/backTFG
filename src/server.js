const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const i18n = require('i18n')
const {
  formatQuery,
  authMiddleware,
  errorsMiddleware,
  checkUser,
} = require('./utils/middlewares');

// Initializations
const app = express();

// Settings
app.set('port', process.env.PORT);
i18n.configure({
  locales: ['es', 'en', 'fr', 'de'],
  directory: 'src/i18n',
  defaultLocale: 'es'
});

// Middlewares
app.use(
  cors({
    origin: 'http://localhost:4200',
    credentials: true,
  })
  );
app.use(i18n.init);
app.use(morgan('dev'));
app.use(express.json());
app.use(formatQuery);
app.use(checkUser);

// Routes
app.use('/api/v1/users', authMiddleware, require('./routes/user.routes'));
app.use('/api/v1/conversations', authMiddleware, require('./routes/conversation.routes'));
app.use('/api/v1/campings', require('./routes/camping.routes'));
app.use('/api/v1/documents', require('./routes/document.routes'));
app.use('/api/v1/', require('./routes/auth.routes'));

// Error Middleware
app.use(errorsMiddleware);

module.exports = app;
