'use strict';

var mongoose = require('mongoose');
var ShortUrl = require('../models/shortUrl');

function fetchShortUrl(req, res) {
  var fetchUrl = ShortUrl.findOne({'slug': req.params.id},
                                 { 'original_url': 1, '_id': 0 }).exec();

  fetchUrl.then(function(short) {
    res.redirect(short.original_url);
  })
  .catch(function(err){
    res.json({'error': "There's no such URL in the database."});
  });
}

module.exports = fetchShortUrl;
