const { check } = require('express-validator');
const { validateResult } = require('../helpers/validateHelper');
const validateTable = require('./table');

const validateCampingLodgings = [
    check('id')
        .exists().withMessage('is_required').bail()
        .notEmpty().withMessage('is_empty').bail()
        .isString().withMessage('invalid_type'),
    (req, res, next) => {
        validateResult(req, res, next);
    },
];

const validateAvailableLodgings = [
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

const validateCreateBooking = [
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

const validateCampingBookings = [
    ...validateTable,
    check('id')
        .exists().withMessage('is_required').bail()
        .notEmpty().withMessage('is_empty').bail()
        .isString().withMessage('invalid_type'),
    (req, res, next) => {
        validateResult(req, res, next);
    },
];

module.exports = { 
    validateCampingLodgings,
    validateAvailableLodgings,
    validateCreateBooking,
    validateCampingBookings,
}