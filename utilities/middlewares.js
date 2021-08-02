// requiring the Joi schema
const {campgroundSchema, reviewSchema} = require('../schema')

const ExpressError = require('./ExpressError')
const Campground = require('../models/campgrounds');
const Review = require('../models/reviews');

module.exports.validateCampground = (req, res, next) =>{
    const {error} = campgroundSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join()  
        //here, details is an array of objects
        // map will iterate over all elements in array.
        // we are returning message from the element in the array
        throw new ExpressError(msg, 400);
    }
    else{
        next();
    }
}

 module.exports.validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body)
    if(error){
        console.log(error)
        const msg = error.details.map(el => el.message).join()
        throw new ExpressError(msg, 400);
    }
    else{
        next()
    }
}

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You need to Login to perform that action!');
        return res.redirect('/login');
    }
    next();
}

module.exports.isOwner = async (req, res, next) =>{
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp.owner.equals(req.user._id)){
        req.flash('error', "You don't have permission to do that");
        return res.redirect(`/campground/${id}`);
    }
    next();
}

module.exports.isAuthor = async (req, res, next) =>{
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', "You don't have permission to do that");
        return res.redirect(`/campground/${id}`);
    }
    next();
}



