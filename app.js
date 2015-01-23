"use strict";

var express = require('express')
var models = require('./models')
var debug = require('debug')('ballistic');
var app = express()
var session = require('express-session')

app.use(express.static('public'));
app.use(session({
  secret: 'tempsecret',
  resave: false,
  saveUninitialized: true
}))

app.use ('/api', function (req, res, next) {
  //req.models.session.find({id: req.session.id}, function (err, sessions) {
    // if(!err && sessions.length > 0){
    // } else {
    //   next();
    // }
  //});
});

app.use('/api/users', require('./api/user'));

app.route('/*').get(function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

models.sequelize.sync().then(function () {
  var server = app.listen(3000, function() {
    debug('Express server listening on port ' + server.address().port);
  });
});

