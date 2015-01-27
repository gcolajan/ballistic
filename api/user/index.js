'use strict';

var express = require('express');
var controller = require('./user');
var router = express.Router();

//router.get('/:id', controller.getInfo);
router.post('/create', controller.create);

module.exports = router;