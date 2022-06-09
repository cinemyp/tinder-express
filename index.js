const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const { Server } = require('socket.io');

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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Import routes
let apiRoutes = require('./routes/index');
let authRoutes = require('./routes/authRoutes');
let photoRoutes = require('./routes/photoRoutes');
const { onConnection } = require('./socket');

app.use('/api', apiRoutes);
app.use('/auth', authRoutes);
app.use('/photo', photoRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);
let count = 0;
const io = new Server(httpServer, {
  serveClient: false,
});
io.on('connection', (socket) => {
  console.log('connect', count++);
  onConnection(io, socket);
});

httpServer.listen(8000, () => {
  console.log('HTTP: We are live on ' + 8000);
});
httpsServer.listen(port, () => {
  console.log('HTTPS: We are live on ' + port);
});

module.exports.app = app;
