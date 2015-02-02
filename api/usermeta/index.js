'use strict';

var express = require('express');
var controller = require('./usermeta');
var router = express.Router();

router.put('/update', controller.create);

module.exports = router;