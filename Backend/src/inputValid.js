
/* VALIDATING THE INPUTS*/
const { check, validationResult } = require('express-validator');



// Validation rules for registration
const validateRegistration = [
    check('name').isLength({ min: 3, max: 15 }).withMessage('Name must be between 3 and 15 characters long'),
    check('email').isEmail().withMessage('Invalid email address'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ];


// Validation rules for login
const validateLogin = [
    check('email').isEmail().withMessage('Invalid email address'),
    check('password').notEmpty().withMessage('Password is required'),
  ];



//  Validation rules for comments
const validateComment = [
    check('content').exists().withMessage('Content is required')
        .isLength({ min: 3, max: 500 }).withMessage('Content must be between 3 and 500 characters')
        .trim().notEmpty().withMessage('Content must not be empty')
];

// Validation rules for  post
const validatePost = [
    check('title').exists().withMessage('Title is required')
        .trim().notEmpty().withMessage('C must not be empty')
        .isLength({ min: 5, max: 50 }).withMessage('Title must be between 5 and 50 characters'),
    check('content').exists().withMessage('Content is required')
        .isLength({ min: 5, max: 500 }).withMessage('Content must be between 5 and 500 characters')
        .trim().notEmpty().withMessage('Content must not be empty'),
    check('tags').optional().isString().withMessage('Tags must be a valid address string'),
    check('image').optional({ checkFalsy: true }).isURL().withMessage('Image must be a valid URL'),
    check('threadId').exists().withMessage('ThreadId is required').isInt().withMessage('ThreadId must be an integer')
];



// Validation rules for threads
const validateThread = check('title').exists().withMessage('Title is required')
    .isLength({ min: 5, max: 50 }).withMessage('Title must be between 5 and 50 characters')


 // Validation rules for name
const validateName = check('name').exists().withMessage('Name is required')
.isLength({ min: 3, max: 15 }).withMessage('Name must be between 3 and 15 characters')
.trim().notEmpty().withMessage('Name must not be empty');


// Validation rules for image profile
const validateImageProfile = check('image_profile_url').exists().withMessage('Profile image URL is required')
.isURL().withMessage('Profile image must be a valid URL');



module.exports = {
    validateRegistration,
    validateLogin,
    validateComment,
    validatePost,
    validateThread,
    validateName,
    validateImageProfile
};
