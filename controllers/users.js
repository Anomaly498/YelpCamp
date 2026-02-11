const User = require('../models/user');

module.exports.renderRegister = (req,res)=>{
    res.render('users/register');
}

module.exports.register = async(req,res,next)=>{
    try{const { password, username, email} = req.body;
    const user = new User({username, email});
    const registerdUser = await User.register(user, password);
    req.login(registerdUser, err=>{ // req.login() tells Passport to take an already-created user, serialize that user into the session, attach the full user object to req.user, and mark the current request as authenticated—without requiring the user to manually log in again.
        if(err) return next(err);
        req.flash('success', 'Welcome to yelpcamp!');
        res.redirect('/campgrounds');        
    })
    }catch(e){
        req.flash('error',e.message);
        res.redirect('/register');
    }
}

module.exports.renderLogin = (req,res)=>{
    res.render('users/login');
}

module.exports.login = async(req,res)=>{
    req.flash('success', 'Welcome Back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete res.locals.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout =  (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}