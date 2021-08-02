const Campground = require('../models/campgrounds');
const {cloudinary} = require('../Cloudinary');

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN

const geoCoder = mbxGeocoding({accessToken : mapBoxToken})

const index = async (req, res, next) => {
    delete req.session.returnPath;
    const allcamps = await Campground.find({})
    res.render('Templates/campground/Allcamps', {allcamps})
};

const newCampForm = (req, res, next)=>{
    req.session.returnPath = req.originalUrl;
    res.render('Templates/campground/new')
}

const newCamp = async(req, res, next) => {
    const geoData = await geoCoder.forwardGeocode({
        query : req.body.campground.location,
        limit : 1
    }).send()
    const newCamp = new Campground(req.body.campground);
    newCamp.geometry = geoData.body.features[0].geometry;               // storing the geometry info from the mapbox response.
    //returning the object containing path and filename of each files in req.files.
    newCamp.images = req.files.map(f => ({url : f.path, filename : f.filename}));
    newCamp.owner = req.user._id;                   // storing the id of logged in user in Campground model.
    newCamp.date = Date().toString().slice(4, 10);
    await newCamp.save();
    req.flash('success', 'Successfully added a new campground!')
    res.redirect(`/campground/${newCamp._id}`)
}

const editCampForm = async (req, res, next)=>{
    req.session.returnPath = req.originalUrl;
    const {id} = req.params;
    const foundCamp = await Campground.findById(id)
    if(!foundCamp.owner.equals(req.user._id)){
        req.flash('error', "You don't have permission to do that");
        return res.redirect(`/campground/${id}`);
    }
    res.render('Templates/campground/edit', {foundCamp})    
};

const editCamp = async(req, res, next)=>{
    const {id} = req.params;
    const img = req.files.map(f => ({url : f.path, filename : f.filename}));
    const foundCamp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    foundCamp.images.push(...img);
    if(req.body.deleteImage){
        for(let filename of req.body.deleteImage){
            cloudinary.uploader.destroy(filename);              // deleting the image from cloudinary
        }
        await foundCamp.updateOne({$pull : {images : { filename : {$in : req.body.deleteImage}}}})
        //pull from the images array, all images whose filename are in the req.body.deleteImage array.
    }
    await foundCamp.save();
    req.flash('success', 'Campground Updated!')
    res.redirect(`/campground/${foundCamp.id}`)
};

const deleteCamp = async(req,res,next) =>{
    const {id} =req.params;
    const camp = await Campground.findById(id);
    if(!camp.owner.equals(req.user._id)){
        req.flash('error', "You don't have permission to do that");
        return res.redirect(`/campground/${id}`);
    }
    const {title} = await Campground.findByIdAndDelete(id)
    for(let img of camp.images){
        cloudinary.uploader.destroy(img.filename);
    }
    req.flash('success', `${title} is deleted succesfully`)
    res.redirect('/campground')
};

const showCamp = async(req, res, next) =>{
    req.session.returnPath = req.originalUrl;
    const {id} = req.params;
    const showCamp = await Campground.findById(id)
    .populate({                                                 // populating the reviews and the authors of that reviews.
        path : 'reviews',
        populate : {
            path : 'author'
        }
    }).populate('owner');
    if(!showCamp){
        req.flash('error', "Couldn't find the campground")
        res.redirect('/campground');
    }
    else{
        res.render('Templates/campground/show', {showCamp});
    }
};

const uploadImage = async (req, res, next) => {
    const {id} = req.params;
    const imgs = req.files.map(f => ({url : f.path, filename : f.filename}));
    const camp = await Campground.findById(id);
    camp.images.push(...imgs);
    await camp.save();
    req.flash('success', `${req.files.length} Image(s) Uploaded`);
    res.redirect(`/campground/${id}`);
}

const searchCamp = async (req,res) => {
    const {title} = req.body.campground;
    const camp = await Campground.findOne({title});
    if(!camp){
        req.flash('error', "Couldn't find any Campground with that name!")
        res.redirect('/campground')
    }
    else{
        res.redirect(`/campground/${camp._id}`);
    }
}

module.exports = {
    index,
    newCampForm,
    newCamp,
    editCampForm,
    editCamp,
    deleteCamp,
    showCamp,
    uploadImage,
    searchCamp
}
