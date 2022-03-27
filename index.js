const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressSession = require('express-session');
const passport = require('passport');
const YandexStrategy = require('passport-yandex').Strategy;

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const credentials = {
  key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
};

const dotenv = require('dotenv');
dotenv.config();

const app = express();

const port = process.env.PORT || 5050;

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

//CONFIGURE
app.use(bodyParser.json());
app.use(expressSession({ secret: 'keyboard cat', cookie: {} }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth', passport.authenticate('yandex'), (req, res) => {
  console.log('start auth');
});
app.get(
  '/auth/callback',
  passport.authenticate('yandex', { failureRedirect: '/login' }),
  (req, res) => {
    console.log('auth successful');
    res.redirect('/redirect');
  }
);
app.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
});
app.get('/redirect', (req, res) => {
  res.redirect('exp://127.0.0.1:19000');
});

//Import routes
let apiRoutes = require('./routes');
let authRoutes = require('./routes/authRoutes');
app.use('/api', apiRoutes);
app.use('/auth', authRoutes);

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

httpServer.listen(8000, () => {
  console.log('HTTP: We are live on ' + 8000);
});
httpsServer.listen(port, () => {
  console.log('HTTPS: We are live on ' + port);
});

const dbPath = process.env.DB_CONNECT_URL;
const options = { useNewUrlParser: true, useUnifiedTopology: true };

const mongo = mongoose.connect(dbPath, options);
mongo.then(
  () => {
    console.log('connected');
  },
  (error) => {
    console.log(error, 'error');
  }
);
