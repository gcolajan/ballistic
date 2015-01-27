"use strict";

var express = require('express')
var debug = require('debug')('ballistic');
var cookieParser = require('cookie-parser')
var session = require('express-session')
var crypto = require('crypto')

var models = require('./models')
var config = require(__dirname + '/config/security.json');


var app = express()

app.use(express.static('public'));
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: true
}));
app.use(cookieParser());

app.use ('/', function (req, res, next) {
  if (req.method === 'POST' || req.method === 'PUT') {
    debug('Post or put request, testing CSRF token...')
    if(req.get('X-XSRF-TOKEN') == req.session.XSRFToken){
      debug('Token match.')
      next();
    } else {
      debug('Token mismatch.')
      res.send({success: false, error: "XSRF Token mismatch."})
    }
  } else if (req.method === 'GET' && !req.cookies['XSRF-TOKEN']) {
    debug('Get request missing CSRF token. Generating and saving...');
    var csrf = crypto.randomBytes(20).toString('hex');
    res.cookie('XSRF-TOKEN', csrf);
    req.session.XSRFToken = csrf;
    //generate and save CSRF token
    next();
  }
});

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

