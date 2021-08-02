const express = require('express');

const router = express.Router();
// requiring error handling utilities 
const catchAsync = require('../utilities/catchAsync')
// requiring models
const Campground = require('../models/campgrounds')

const {validateCampground, isLoggedIn, isOwner} = require('../utilities/middlewares')
//requiring Campground Controllers
const campController = require('../controllers/campController')
//requiring multer middleware
const multer = require('multer');

const {storage} = require('../Cloudinary');
const upload = multer({storage});               


//grouping routes with same path
router.route('/')
    .get(catchAsync(campController.index))             //showing All Camps
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campController.newCamp));  // Adding New Camp

// Form for New Campground
router.get('/new', isLoggedIn, campController.newCampForm)

router.post('/search', catchAsync(campController.searchCamp));


router.route('/:id')
    .patch(isLoggedIn, isOwner, upload.array('image'), validateCampground, catchAsync(campController.editCamp))   // Updating Campground
    .delete(isLoggedIn, isOwner, catchAsync(campController.deleteCamp))     //Deleting Campground
    .get(catchAsync(campController.showCamp))                               //Showing Selected Camp

// Form to Edit Campground
router.get('/:id/edit', isLoggedIn, isOwner, catchAsync(campController.editCampForm))



// for uploading image from show page
router.post('/:id/upload', isLoggedIn, upload.array('image'), catchAsync(campController.uploadImage))



module.exports = router
