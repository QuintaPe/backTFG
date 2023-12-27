import jwt from 'jsonwebtoken';
import { HandledError } from '../errors/HandledError.js';
const jwtSecret = process.env.JWT_SECRET;

export const checkUser = (req, res, next) => {
  const auth = req.headers['authorization'];
  const token = auth && auth.split(' ')[1];

  const nonAuthPaths = ['/api/v1/login', '/api/v1/signup'];
  if (token && !nonAuthPaths.includes(req.path)) {
    try {
      const decode = jwt.verify(token, jwtSecret);
      req.user = decode.user;
    } catch (err) {
      const error = new HandledError(err.name, err.message);
      return errorsMiddleware(error, req, res);
    }
  } 
  next();
};

export const authMiddleware = (req, res, next) => {
  if (!req.user?._id) {
    res.status(401).send('Unauthorized');
  } else {
    next();
  }
};

export const formatQuery = (req, res, next) => {
  if (req.method === 'GET') {
    req.query = Object.fromEntries(
      Object.entries(req.query).map(([key, val]) => {
        try {
          return [key, JSON.parse(val)];
        } catch {
          return [key, val];
        }
      })
    );
  }
  next();
};

export const errorsMiddleware = (err, req, res) => {
  let error = err;
  if (error?.name == 'ValidationError') {
    const aux = Object.values(error.errors)[0];
    const errorCode = aux.message.toLowerCase().replace(/ /g, '_');
    error = new HandledError(errorCode, aux.message, 422);
  } else if (!error.statusCode || error.statusCode >= 600) {
    error = new HandledError('internal_server_error', 'Internal Server Error', 500);
  }

  return res.status(error.statusCode).json(error);
};