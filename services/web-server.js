const http = require('http');
const express = require('express');
const webServerConfig = require('../config/web-server.js');
const morgan = require('morgan');
const database = require('./database.js');
const router = require('./router.js');
const authentication = require('./authentication.js');
 
let httpServer;
 
function initialize() {
  return new Promise((resolve, reject) => {
    const app = express();
    httpServer = http.createServer(app);

// Combines logging info from request and response
    app.use(morgan('combined'));

 // Parse incoming JSON requests and revive JSON.
    app.use(express.json({
      reviver: reviveJson
    }));

// Serves static files from the www directory
    app.use(express.static('./www'));

// Configure the web server to authenticate users
    authentication.initWebServer(app);
 
    // *** app.get call below this line ***
 
    app.use('/api', router);
 
    httpServer.listen(webServerConfig.port)
      .on('listening', () => {
        console.log(`Web server listening on localhost:${webServerConfig.port}`);
 
        resolve();
      })
      .on('error', err => {
        reject(err);
      });
  });
}
 
module.exports.initialize = initialize;

// *** previous code above this line ***
 
function close() {
  return new Promise((resolve, reject) => {
    httpServer.close((err) => {
      if (err) {
        reject(err);
        return;
      }
 
      resolve();
    });
  });
}
 
module.exports.close = close;

const iso8601RegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
 
function reviveJson(key, value) {
  // revive ISO 8601 date strings to instances of Date
  if (typeof value === 'string' && iso8601RegExp.test(value)) {
    return new Date(value);
  } else {
    return value;
  }
}
