const User = require('../models/users');

const registerForm = (req,res) =>{
    res.render('Templates/users/register')
};

const registerUser = async(req, res, next) =>{
    try {
        const {email, username, password} = req.body;
        const user = new User({username, email});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {                                    // To direclty login the user after register.
            if(err) return next(err);                                           // if there is error then return next with that error.
            req.flash('success', `Welcome to YelpCamp, ${username}`);
            res.redirect('/campground');
        })
    } catch (e) {
            req.flash('error', e.message);
            res.redirect('/register');
    }   
};

const loginForm = (req, res) => {
    res.render('Templates/users/login');
};

const loginUser = (req, res) => {
    // using Logical OR operator. 
    // If req.session.returnTo or req.session.returnPath has value then it will be stored to redirect
    // or else value will be campground 
    const redirect = req.session.returnTo || req.session.returnPath || '/campground';
    delete req.session.returnTo;
    delete req.session.returnPath;
    req.flash('success', `Welcome Back, ${req.body.username}`);
    res.redirect(redirect)
    
    // Same thing using If-else

    // if(req.session.returnTo){                                        
    //     const redirect = req.session.returnTo;  
    //     delete req.session.returnTo;
    //     res.redirect(redirect);        
    // }else{
    //     res.redirect('/campground');
    // }    
};

const logoutUser = (req, res) => {
    req.logout();
    req.flash('success', 'You have been logged out')
    res.redirect('/campground');
};

module.exports = {
    registerForm,
    registerUser,
    loginForm,
    loginUser,
    logoutUser
}
