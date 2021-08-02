const express = require('express');

const router = express.Router({mergeParams : true});

// requiring error handling utilities 
const catchAsync = require('../utilities/catchAsync')

// requiring campground models
const Campground = require('../models/campgrounds')
// requiring review models
const Review = require('../models/reviews')

// validating reviews
const {validateReview, isLoggedIn, isAuthor} = require('../utilities/middlewares');
const reviewController = require('../controllers/reviewController');

router.post('/', validateReview, isLoggedIn, catchAsync(reviewController.addReview))

router.delete('/:reviewId', isLoggedIn, isAuthor, catchAsync(reviewController.deleteReview));


module.exports = router;