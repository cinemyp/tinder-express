const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

//CONFIG
const dotenv = require('dotenv');
dotenv.config();
app.use(bodyParser.json());

const port = process.env.PORT;

//Import routes
let apiRoutes = require('./routes');
app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log('We are live on ' + port);
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
