import { validationResult } from 'express-validator';

export const validateResult = (req, res, next) => {
  try {
    validationResult(req).throw();
    return next();
  } catch (err) {
    return res.status(403).send({ errors: err.array() });
  }
};