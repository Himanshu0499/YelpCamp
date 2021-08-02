if(process.env.NODE_ENV !== "production") {                 //requiring dotenv package if in development
    require('dotenv').config()
}

// requiring express
const express = require('express'); 
// requiring mongoose package                     
const mongoose = require('mongoose'); 
// requiring path from express
const path = require('path');
// requiring method-override package                               
const methodOverride = require('method-override') 
// requiring ejs-mate package          
const ejsMate = require('ejs-mate');  
// requiring express-session
const session = require('express-session');   
// requiring connect-flash package
const flash = require('connect-flash');  
// requring the User model.
const User = require('./models/users'); 
// requiring passport for authentication                    
const passport = require('passport');   
 // requiring passport-local strategy.                    
const LocalStrategy = require('passport-local');
// requiring express-mongo-sanitize to prevent Mongo injection     
const mongoSanitize = require('express-mongo-sanitize');    
// requiring helmet.
const helmet = require('helmet')                            
// requiring the urls for Content-Security-Policy
const {scriptSrcUrls, styleSrcUrls, connectSrcUrls, fontSrcUrls} = require('./utilities/CSPSrcUrls')
// connect-mongo to store sessions in Mongo.
const MongoStore = require('connect-mongo');    
//requiring ExpressError class
const ExpressError = require('./utilities/ExpressError');

//requiring Routes
const campgroundRoutes = require('./routes/campgroundRouter')     // campground router
const reviewRoutes = require('./routes/reviewRouter')             // review router
const userRoutes = require('./routes/userRouter');                // user router

// executing express
const app = express();                                      


 // setting view engine to ejs
app.set('view engine', 'ejs');
// joining views 
app.set('views', path.join(__dirname,'views'))
// serving static folder
app.use(express.static(path.join(__dirname, 'public'))) 
// Parsing form data
app.use(express.urlencoded({ extended : true})) 
// executing mongoSanitize
app.use(mongoSanitize())                                    
// using method-override to send requests from form(like PUT, POST, Delete)
app.use(methodOverride('_method'))                          
 // Using package for ejs layouts boilerplate
app.engine('ejs', ejsMate)                                 
 


//mongoDB URL.
//const dbUrl = process.env.MONGO_DB_URL || 'mongodb://localhost:27017/yelp-camp';  // set dbUrl to this for using Mongo Atlas
const dbUrl = 'mongodb://localhost:27017/yelp-camp';
//session secret
//const secret = process.env.SECRET || 'Thisismysecret';            // TO use secret key form env file 
const secret = 'Thisismysecret';



//Connecting to mongoose to mongodb
mongoose.connect(dbUrl, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex : true
})
.then(() =>{
    console.log("Datbase Connected!");
})
.catch( err => {
    console.log("Connection failed",err)
})

// To avoid mongoose Deprecation Warnging
mongoose.set('useFindAndModify', false)


// making store to store sessions
const store = new MongoStore({
    mongoUrl : dbUrl,
    secret,
    touchAfter : 24 * 60 * 60       // time period in seconds 24hr, 60min, 60sec. Session will be updated only after 24hrs
})

// if any error occurs in mongo-store
store.on("error", function(e){
    console.log("Something went wrong!Mongo store error", e)
})

app.use(session({
    store,
    name : 'session',
    secret,
    resave : false,
    saveUninitialized : true,
    cookie : {
        // Setting expiration date of cookie to One week,
        // (1000ms = 1s, 60sec = 1min, 60min = 1hr, 24hrs = 1 day, 7days = 1 week) 
        expires : Date.now() + 1000 * 60 * 60 * 24 * 7,
        httpOnly : true         // cookies will only accessible over HTTP and not through javascript.
        // secure : true        // cookies will only configured/changed over secure connections i.e. https.
    }
}))

app.use(flash());                                           // executing falsh()

// using helmet for securing express app by adding HTTP headers.
// configuring contentSecurityPolicy to allow particular sites sources.
// source Urls defined in utilities/CSPSrcUrls.js
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dnzjrylqa/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


// initializing passport
app.use(passport.initialize()); 
// using passport session for persistent login session.                            
app.use(passport.session());

// telling passport to use LocalStrategy, and authenticate() method on User model.
passport.use(new LocalStrategy(User.authenticate()));

// serializing(storing in session) and deserializing(removing from session) the user. 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) => {   
    // contains deserialized user info. Can be used to give user access to certain things only after he/she is logged in
    res.locals.currentUser = req.user;              
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})


//Home page
app.get('/', (req, res) => {
    res.render('Templates/home')
})


//User Routes
app.use('/', userRoutes);
// Campground Routes
app.use('/campground', campgroundRoutes);
// Review Routes
app.use('/campground/:id/review', reviewRoutes);

app.use('*', (req, res, next) => {
    next(new ExpressError('Page Not Found!', 404))
})


// Error Handling middleware

app.use( async(err, req, res, next) => {
    const {status, message} = err;
    if(status === 404){
        res.render('Templates/error', {status, message});
    }else{
        const redirectPath = req.session.returnPath;
        delete req.session.returnPath
        req.flash('error', `${status}, ${message}`);
        res.redirect(redirectPath);
    }
    //res.render('Templates/error', {status, message});
    // if(process.env.NODE_ENV !== 'production'){
    //     console.log(err.stack)
    // }     
})


app.listen(3000, ()=>{
    console.log("Listening to port 3000");
})