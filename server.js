'use strict';
require('dotenv').config();
const express = require('express');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const myApp = require('./app');

const app = express();
app.use(myApp);

fccTesting(app); //For FCC testing purposes

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
