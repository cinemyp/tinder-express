const passport = require('passport');
const YandexStrategy = require('passport-yandex').Strategy;
const Profile = require('../models/profileModel');

//Configure Authentication Strategy
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new YandexStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: 'http://192.168.0.17:8000/auth/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      //Registration
      console.log(profile);
      return done(null, profile);
    }
  )
);

exports.auth = (req, res) => {
  console.log('start auth');
};
exports.callback = (req, res) => {
  console.log('auth successful');
  res.redirect('exp://127.0.0.1:19000');
};
exports.loguout = (req, res) => {
  req.logOut();
  res.redirect('/');
};
