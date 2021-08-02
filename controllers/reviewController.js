const Campground = require('../models/campgrounds');
const Review = require('../models/reviews');

const addReview = async (req,res,next)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    camp.reviews.push(newReview);
    await newReview.save();
    await camp.save();
    req.flash('success', 'New review added!')
    res.redirect(`/campground/${id}`);
};
    
const deleteReview = async (req,res,next) => {
    const {id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull : {reviews : reviewId}});             // pulling/removing the element from reviews array that matches reviewId
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted!')
    res.redirect(`/campground/${id}`);
};


module.exports = {
    addReview,
    deleteReview
}