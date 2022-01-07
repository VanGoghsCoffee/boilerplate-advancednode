'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const ObjectID = require('mongodb').ObjectID;
const session = require('express-session');
const passport = require('passport');
const fccTesting = require('./freeCodeCamp/fcctesting.js');

const app = express();

app.set('view engine', 'pug');

fccTesting(app); //For FCC testing purposes
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


myDB(async client => {

  const myDataBase = await client.db('database').collection('users');

  app.route('/').get((req, res) => {
    res.render('pug/index', { title: 'Connected to Database', message: 'Please login' });
  });

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  
  passport.deserializeUser((id, done) => {
    myDatabase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
      done(null, doc);
    });
  });

}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('pug/index', { title: e, message: 'Unable to login' });
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
