const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const passport = require('passport');

const User = require('../models/users');
const userController = require('../controllers/userController');
 
router.route('/register')
    .get( userController.registerForm)     // Render registration form
    .post( userController.registerUser)     // Adding the User.

router.route('/login')
    .get(userController.loginForm)              //Render Login Form 
    .post(passport.authenticate('local', {      // Login the User
    failureFlash : true,
    failureRedirect : '/login'
}), userController.loginUser);

router.get('/logout', userController.logoutUser)

module.exports = router;