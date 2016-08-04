'use strict';

var mongoose = require('mongoose');
var ShortUrl = require('../models/shortUrl');

function fetchShortUrl(req, res) {
  ShortUrl.findOne({'slug': req.params.id}, { 'original_url': 1, '_id': 0 }, function(err, short) {
    if (short) {
      res.redirect(short.original_url);
    } else {
      res.json({'error': "There's no such URL in the database."});
    }
  });
}

module.exports = fetchShortUrl;
