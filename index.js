const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

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

//Database Configure
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

//CONFIGURE
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Import routes
let apiRoutes = require('./routes/index');
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
