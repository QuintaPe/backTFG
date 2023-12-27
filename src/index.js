// Initializations
import './init.js';
import './database.js';
import './mailer.js';

// Read environment variables
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import i18n from 'i18n';

import { userRouter } from './routes/user.routes.js'
import { conversationRouter } from './routes/conversation.routes.js'
import { campingRouter } from './routes/camping.routes.js'
import { documentRouter } from './routes/document.routes.js'
import { authRouter } from './routes/auth.routes.js'

import {
  formatQuery,
  authMiddleware,
  errorsMiddleware,
  checkUser,
} from './middlewares/middlewares.js';

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
app.use('/api/v1/users', authMiddleware, userRouter);
app.use('/api/v1/conversations', authMiddleware, conversationRouter);
app.use('/api/v1/campings', campingRouter);
app.use('/api/v1/documents', documentRouter);
app.use('/api/v1/', authRouter);

// Error Middleware
app.use(errorsMiddleware);

// Server is listening
app.listen(app.get('port'), () => {
  console.log('Server on port', app.get('port'));
});
