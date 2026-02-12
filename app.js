if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const sanitizeV5 = require('./utils/mongoSanitizeV5.js');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
mongoose.set('strictPopulate', false);
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const { error } = require('console');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'; // defined here for context
const { MongoStore } = require('connect-mongo');

const session = require('express-session');
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs',ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.set('query parser', 'extended');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))
app.use(sanitizeV5({ replaceWith: '_' }));
app.use(helmet()); // Enables the other 10 security headers (like XSS protection)

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on("error", function (e){
    console.log("Session Store Error", e)
})
const sessionConfig = {
    store,
    name: 'session',
    secret : 'thisshouldbeabettersecret!',
    resave : false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge : 1000 * 60 * 60 * 24 * 7

    }
}
app.use(session(sessionConfig));
app.use(flash());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/", 
    "https://cdn.maptiler.com/", 
];

const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.maptiler.com/", 
    "https://cdn.jsdelivr.net/", 
];

const connectSrcUrls = [
    "https://api.maptiler.com/", 
    "https://cdn.jsdelivr.net/", // <--- ADDED THIS to fix the map error
];

const fontSrcUrls = [
    "https://fonts.gstatic.com/",
];
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
                "https://res.cloudinary.com/dvpbaaknu/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);




app.use(passport.initialize());
app.use(passport.session());// keep in mind that ' app.use(passport.session());'  needs to be after "app.use(session(sessionConfig));" just like it is now.
passport.use(new LocalStrategy(User.authenticate())) // so what we're saying here is that, hello, Passport, we would like you to use the LocalStrategy that we have downloaded and required, and for that LocalStrategy the authentication method is going to be located on our 'user' model and it's called authenticate.Now we don't have a method on here called authenticate, at least not one that we made. But again, it's coming from this passportLocalMongoose.
passport.serializeUser(User.serializeUser());// thse two methods of serialize and deserialize that we're specifying here on our 'user' model. They've also been added in automatically for us.
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;// req.user is an object that Passport automatically adds to every request by reading the logged-in user’s ID from the session, deserializing it to fetch the full user data from the database, and attaching that data to the request so we always know who the current user is without manually accessing the session or querying the database ourselves.
    res.locals.success = req.flash("success");// res.locals is a place to store data that is automatically available in ALL EJS templates for the current request.
    res.locals.error = req.flash("error");
    next();
})

app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.get('/',(req,res) => {
    res.render('home');
});






app.all(/.*/,(req,res,next)=>{
 next(new ExpressError('Page not found', 404))
})
app.use((err,req,res,next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Oh No, Somethingwent Wrong'
    res.status(statusCode).render('error',{ err });
})

app.listen(3000, ()=>{
    console.log("seving on port 3000");
})

// Triggering fresh build for styles