const PORT = process.env.PORT || 8443;

const enforce = require('express-sslify'); // enforce redirect to https
const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const sslCert = {
  key: fs.readFileSync(`${__dirname}/../server.key`),
  cert: fs.readFileSync(`${__dirname}/../server.crt`),
  ca: fs.readFileSync(`${__dirname}/../ca.crt`),
  requestCert: true,
  rejectUnauthorized: false,
};


// server to redirect http to https
const appHTTP = express();
const serverHTTP = require('http').createServer(appHTTP);

serverHTTP.listen(8000, (err) => {
  console.log(err || 'Express http redirect to https listening on port 8000');
});

appHTTP.get('*', (req, res) => {
  console.log('REDIRECTING TO HTTPS');
  // res.redirect('https://localhost:8443');
  res.writeHead(301, { Location: 'https://localhost:8443' });
  res.end();
});

// use this to redirect http to https
// appRedirect.use(enforce.HTTPS());
// require('http').createServer(appRedirect).listen(8000, () => {
//   console.log('Express http to https redirect listening on port 8000');
// });

// https server
const app = express();
const server = require('https').createServer(sslCert, app);

server.listen(PORT, (err) => {
  console.log(err || `Express https listening on port ${PORT}`);
});

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

require('./config/webpack')(app);

// ERROR/SEND HANDLE
app.use((req, res, next) => {
  res.handle = (err, data) => res.status(err ? 400 : 200).send(err || data);
  next();
});

app.use('/api', require('./routes/api'));

// ALLOW REACT ROUTING
app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});
