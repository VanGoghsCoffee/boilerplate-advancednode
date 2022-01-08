'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const ObjectID = require('mongodb').ObjectID;
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const fccTesting = require('./freeCodeCamp/fcctesting.js');

const app = express();
app.set('view engine', 'pug');
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'HOLA',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

function ensureAuthenticated(req, res, next) {

  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

myDB(async client => {

  const myDataBase = await client.db('database').collection('users');

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  
  passport.deserializeUser((id, done) => {
    myDatabase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
      done(null, doc);
    });
  });

  app.route('/')
    .get((req, res) => {
        res.render('pug/index', { title: 'Connected to Database', message: 'Please login', showLogin: true });
    });

  app.route('/profile')
    .get(ensureAuthenticated, (req, res) => {
      res.render('pug/profile', { username: req.user.username });
    });

  app.route('/login')
    .post(
        passport.authenticate('local', { failureRedirect: '/'} ), (req, res) => {
            res.redirect('/profile');
        });

  passport.use(new LocalStrategy(
    function(username, password, done) {
      myDataBase.findOne({ username: username }, function(err, user) {
        console.log('user ' + username + ' attempted to log in.');
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (password !== user.password ) { return done(null, false); }
        return done(null, user);
      });
    }
  ));

}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('pug/index', { title: e, message: 'Unable to login' });
  });
});

fccTesting(app); //For FCC testing purposes

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
