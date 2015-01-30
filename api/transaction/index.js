'use strict';

var express = require('express');
var controller = require('./transaction');
var router = express.Router();

router.post('/create', controller.create);
router.get('/list', controller.list);

module.exports = router;