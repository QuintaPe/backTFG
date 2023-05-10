const { check } = require('express-validator');
const { validateResult } = require('../helpers/validateHelper');

const validateAvailableLodging = [
    check('id')
        .exists().withMessage('is_required').bail()
        .notEmpty().withMessage('is_empty').bail()
        .isString().withMessage('invalid_type'),
    check('startDate')
        .exists().withMessage('is_required').bail()
        .notEmpty().withMessage('is_empty').bail()
        .isISO8601().toDate().withMessage('invalid_type'),

    check('endDate')
        .exists().withMessage('is_required').bail()
        .notEmpty().withMessage('is_empty').bail()
        .isISO8601().toDate().withMessage('invalid_type'),
    (req, res, next) => {
        validateResult(req, res, next);
    }
];

module.exports = { 
    validateAvailableLodging,
}