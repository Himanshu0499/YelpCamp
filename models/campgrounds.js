const mongoose = require('mongoose');
const Review = require('./reviews');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url : String,
    filename : String
})

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200')
})
// using mongoose virtuals to add property on image url. We are setting the width to 200 by using replace on the url

const opt = { toJSON : {virtuals : true} };     // To include virtuals when a document is converted to JSON.

const campgroundSchema = new Schema({
    images : [ImageSchema],
    geometry : {                            //storing the GeoJson data we got from mapbox.
        type : {
            type : String,  
            enum : ['Point'],               // specifying that type should only be 'Point'.
            required : true
        },
        coordinates: {
            type: [Number],                 // coordinates should be array of numbers.
            required : true
        }
    },
    title : String,
    price : Number,
    location : String,
    description : String,
    date : String,
    reviews : [{
        type : Schema.Types.ObjectId,
        ref : 'Review'
    }],
    owner : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    }
},opt)

// We want popUp to be nested in properties.
campgroundSchema.virtual('properties.popUp').get(function(){
    return `
    <h6><a href="/campground/${this._id}">${this.title}</a></h6>
    <p>${this.location}</p>`
})

campgroundSchema.post('findOneAndDelete', async(camp) => {
    //if reviews array of the camp is not empty.
    if(camp.reviews.length){
        //delete the revies whose _id is in the the reviews array of the camp.
        const res = await Review.deleteMany({_id : {$in : camp.reviews}});
        console.log(res);
    }
})


module.exports = mongoose.model('Campground', campgroundSchema)