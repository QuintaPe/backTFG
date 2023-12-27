import { check } from 'express-validator';
import { validateTable } from './table.js';
import { validateResult } from '../helpers/validateHelper.js';

export const validateCampingLodgings = [
  check('id')
    .exists().withMessage('is_required').bail()
    .notEmpty().withMessage('is_empty').bail()
    .isString().withMessage('invalid_type'),
  (req, res, next) => {
    validateResult(req, res, next);
  },
];

export const validateAvailableLodgings = [
  check('id')
    .exists().withMessage('is_required').bail()
    .notEmpty().withMessage('is_empty').bail()
    .isString().withMessage('invalid_type'),
  check('entryDate')
    .exists().withMessage('is_required').bail()
    .notEmpty().withMessage('is_empty').bail()
    .isISO8601().toDate().withMessage('invalid_type'),

  check('exitDate')
    .exists().withMessage('is_required').bail()
    .notEmpty().withMessage('is_empty').bail()
    .isISO8601().toDate().withMessage('invalid_type'),
  (req, res, next) => {
    validateResult(req, res, next);
  },
];

export const validateCreateBooking = [
  check('id')
    .exists().withMessage('is_required').bail()
    .notEmpty().withMessage('is_empty').bail()
    .isString().withMessage('invalid_type'),
  check('entryDate')
    .exists().withMessage('is_required').bail()
    .notEmpty().withMessage('is_empty').bail()
    .isISO8601().toDate().withMessage('invalid_type'),
  check('exitDate')
    .exists().withMessage('is_required').bail()
    .notEmpty().withMessage('is_empty').bail()
    .isISO8601().toDate().withMessage('invalid_type'),
  check('lodgings')
    .exists().withMessage('is_required').bail()
    .notEmpty().withMessage('is_empty').bail()
    .isObject().withMessage('invalid_type'),
  check('paymentMethod')
    .exists().withMessage('is_required').bail()
    .notEmpty().withMessage('is_empty').bail()
    .isString().withMessage('invalid_type'),
  (req, res, next) => {
    validateResult(req, res, next);
  },
];

export const validateCampingBookings = [
  ...validateTable,
  check('id')
    .exists().withMessage('is_required').bail()
    .notEmpty().withMessage('is_empty').bail()
    .isString().withMessage('invalid_type'),
  (req, res, next) => {
    validateResult(req, res, next);
  },
];