'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const passport = require('passport');
const routes = require('./routes');
const auth = require('./auth');
const session = require('express-session');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const cors = require('cors');
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')(session);
const URI = process.env.MONGO_URI;
const store = new MongoStore({ url: URI });

const app = express();
app.use(cors());
const http = require('http').createServer(app);
const io = require('socket.io')(http);
io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'express.sid',
    secret: process.env.SESSION_SECRET,
    store: store,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
  })
);

app.set('view engine', 'pug');
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  key: 'express.sid',
  secret: process.env.SESSION_SECRET || 'HOLA',
  resave: true,
  store: store,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

myDB(async client => {

  const myDataBase = await client.db('database').collection('users');
  routes(app, myDataBase);
  auth(app, myDataBase);

  let currentUsers = 0;
  io.on('connection', socket => {
    ++currentUsers;
    console.log('user ' + socket.request.user.name + ' connected');
    io.emit('user count', currentUsers);

    socket.on('disconnect', () => {
      --currentUsers;
      io.emit('user count', currentUsers);
    });
  })

}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('pug/index', { title: e, message: 'Unable to login' });
  });
});

function onAuthorizeSuccess(data, accept) {
  
  console.log('successful connection to socket.io');
  accept(null, true);
}

function onAuthorizeFail(data, message, error, accept) {

  if (error) throw new Error(message);
  console.log('failed connection to socket.io:', message);
  accept(null, false);
}

fccTesting(app); //For FCC testing purposes

const PORT = process.env.PORT || 3002;
http.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
