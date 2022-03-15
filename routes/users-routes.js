const express = require('express');

const { check } = require('express-validator');

const fileUpload = require('../middlewares/file-upload');

const userController = require('../controllers/user-controller');

const router = express.Router();

router.get('/',userController.getUsers);

router.post('/signup', 
fileUpload.single('image'),
[   
    check('name').not().isEmpty().withMessage('The name field is required'),
    check('password').isLength({min:6}).withMessage('Password must contain at least 6 characters'),
    check('email').normalizeEmail().isEmail().withMessage('Email is invalid')
],
    userController.signUp);

router.post('/login',userController.logIn);


module.exports = router;