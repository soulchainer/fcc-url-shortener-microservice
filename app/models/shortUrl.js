var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
// set Promise provider to bluebird
mongoose.Promise = require('bluebird');

var Schema = mongoose.Schema;

var urlSchema = new Schema({
  original_url: {
    type: String,
    required: true,
    match: /^(http|https|ftp)\:\/\/.*$/,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  }
}, { capped: 31457280}); /* Limit space to a max of 30 MB (in bytes)*/

/* ValidationError when try to save a document with already saved unique value */
urlSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' });

module.exports = mongoose.model('ShortUrl', urlSchema, 'shortUrl');
