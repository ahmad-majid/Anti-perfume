const { body, validationResult } = require('express-validator');

const validateRegister = [
  body('username').notEmpty().withMessage('Username is required').isLength({ min: 2 }).withMessage('Username must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const validateReview = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required').isLength({ min: 5 }).withMessage('Comment must be at least 5 characters'),
];

const validateCoupon = [
  body('code').notEmpty().withMessage('Coupon code is required'),
  body('discountType').isIn(['percentage', 'fixed']).withMessage('Discount type must be percentage or fixed'),
  body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be a positive number'),
  body('expiresAt').isISO8601().withMessage('Valid expiration date is required'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

module.exports = { validateRegister, validateLogin, validateReview, validateCoupon, handleValidationErrors };
