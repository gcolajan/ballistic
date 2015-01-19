"use strict";

var express = require('express')
var models = require('./models')
var debug = require('debug')('ballistic');
var app = express()

app.use(express.static('public'));

models.sequelize.sync().then(function () {
  var server = app.listen(3000, function() {
    debug('Express server listening on port ' + server.address().port);
  });
});

