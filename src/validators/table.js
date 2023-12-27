import { check } from 'express-validator';

export const validateTable = [
  check('page')
    .exists().withMessage('is_required').bail()
    .isInt().withMessage('invalid_type'),
  check('size')
    .exists().withMessage('is_required').bail()
    .isInt().withMessage('invalid_type'),
  check('search')
    .exists().withMessage('is_required').bail()
    .isString().withMessage('invalid_type'),
  check('filters')
    .exists().withMessage('is_required').bail()
    .isObject().withMessage('invalid_type'),
  check('sort')
    .exists().withMessage('is_required').bail()
    .isString().withMessage('invalid_type'),
];