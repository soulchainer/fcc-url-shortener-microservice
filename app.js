'use strict';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./_config');
var router = require('./app/routes');

var app = express();

var mongoURI = config.mongoURI[app.settings.env];

mongoose.connect(mongoURI, function(err, res) {
  if(err) {
    console.log('Error connecting to the database. ' + err);
  } else {
    console.log('Connected to Database!');
  }
});

/** Serve static content in folder public/ */
app.use(express.static('public'));
app.use(router);

if(app.settings.env !== 'test'){
  app.listen(config.port[app.settings.env], function() {
    var port = config.port[app.settings.env];
    console.log('Server listening on port %s!', port);
  });
}

module.exports = app;
