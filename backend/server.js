const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const User = require("./models/user");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bodyParser = require("body-parser");
const app = express();

// ====== CONFIG ======
const mongoURI = "mongodb+srv://duypooh2909:baoduy290609@duynh.9ujgdwv.mongodb.net/login_app?retryWrites=true&w=majority&appName=duynh";
const googleClientID = "698365045813-ejggmgjfm61m896tdp42hilgpnn93rri.apps.googleusercontent.com";
const googleClientSecret = "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";

// ====== MONGODB ======
mongoose.connect(mongoURI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error(err));

// ====== MIDDLEWARE ======
app.use(cors({ origin: ["http://localhost:5000", "login.ejs"], credentials: true })); // cho phép frontend React
app.use(express.json());

app.use(session({
    secret: googleClientSecret,
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");
app.use(express.static("views"));
app.use(bodyParser.urlencoded({ extended: true }));

// ====== PASSPORT ======
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => done(null, user))
        .catch(err => done(err));
});

passport.use(new GoogleStrategy({
    clientID: googleClientID,
    clientSecret: googleClientSecret,
    callbackURL: "http://localhost:5000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
        user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails?.[0]?.value
        });
    }
    return done(null, user);
}));

// ====== ROUTES ======
// Home page
app.get('/', (req, res) => {
    res.render('homepage', { title: 'Home Page' });
});
// Login
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login Page' });
});

// Bắt đầu đăng nhập Google
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google redirect lại sau login
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/dashboard'); // Trang chính sau khi đăng nhập
    }
);

// Middleware to check authentication
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    res.status(401).send("Bạn chưa đăng nhập.");
}

// Route test dashboard
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.send("🎉 Chào mừng! Bạn đã đăng nhập thành công bằng Google.");
});
// Logout
app.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});
    //res.redirect('/');


// ====== START SERVER ======
app.listen(5000, () => console.log("🚀 Server running at http://localhost:5000"));
