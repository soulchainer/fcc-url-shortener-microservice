'use strict';

var chance = require('chance').Chance();
var mongoose = require('mongoose');
var ShortUrl = require('../models/shortUrl');
var url = require('url');

function fetchFormerUrl(originalUrl, res) {
  ShortUrl.aggregate([
    { $match: { 'original_url': originalUrl } },
    { $project: {
      '_id': 0,
      'original_url': 1,
      'short_url': {$concat: [ res.locals.baseUrl, '$slug' ] }
    } }
  ], function(err, short) {
    res.json(short[0]);
  });
}
function generateRandomSlug(length) {
  var POOL = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!-_*';
  return chance.string({length: length, pool: POOL});
}

function joinShortUrl(res) {
  return res.locals.baseUrl + res.locals.slug;
}

function getFieldErrorType (err) {
  var validationError = (err.name === 'ValidationError');
  if (validationError) {
    var errors = err.errors;
    var originalUrlError = "original_url" in errors;
    var slugError = "slug" in errors;
    if (originalUrlError) {
      var kind = errors.original_url.kind;
      return (kind === "regexp")? 'wrongUrlFormat': 'nonUniqueUrl';
    }
    if (slugError) {
      return 'nonUniqueSlug';
    }
  }
}

function handleFieldError (fieldError, req, res, short) {
  switch (fieldError) {
    case 'wrongUrlFormat':
      res.json({ 'error': 'Wrong url format, make sure you have a valid protocol and a real site.'});
      break;
    case 'nonUniqueUrl':
      /* fetch and return the appropiate URL register from the DDBB */
      fetchFormerUrl(short.original_url, res);
      break;
    default: /* nonUniqueSlug */
      var slug = '';
      do {
        slug = generateRandomSlug(5);
      } while (slug === res.locals.slug);
      registerNewShortUrl(req, res);
  }
}

function registerNewShortUrl(req, res) {
  res.locals.slug = res.locals.slug || generateRandomSlug(5);
  res.locals.baseUrl = res.locals.baseUrl || url.format({
    protocol: req.protocol,
    host: req.get('host'),
    pathname: "/"
  });
  var json = {};
  var newShortUrl = new ShortUrl({
    original_url : req.params.originalUrl,
    slug: res.locals.slug
  });
  newShortUrl.save(function(err, short) {
    if (err) {
      var fieldError = getFieldErrorType(err);
      if (fieldError) {
        handleFieldError(fieldError, req, res, newShortUrl);
      } else {
        json.error = err.message;
        res.json(json);
      }
    } else {
      json.original_url = short.original_url,
      json.short_url = joinShortUrl(res);
      res.json(json);
    }
  });
}

module.exports = registerNewShortUrl;
