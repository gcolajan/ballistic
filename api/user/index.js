'use strict';

var express = require('express');
var controller = require('./user');
var router = express.Router();

//router.get('/:id', controller.getInfo);
router.post('/create', controller.create);
router.post('/authenticate', controller.authenticate);

module.exports = router;