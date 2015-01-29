'use strict';

var express = require('express');
var controller = require('./user');
var router = express.Router();

router.post('/create', controller.create);
router.post('/authenticate', controller.authenticate);
router.get('/session', controller.session);
router.post('/logout', controller.logout);

module.exports = router;