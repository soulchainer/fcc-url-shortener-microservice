'use strict';

var router = require('express').Router();
var registerUrl = require('./registerUrl.js');
var fetchUrl = require('./fetchUrl.js');

router.get('/new/:originalUrl(*)', registerUrl);
router.get('/:id', fetchUrl);

module.exports = router;
