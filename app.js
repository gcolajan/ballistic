"use strict";

var express = require('express');
var debug = require('debug')('ballistic');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var crypto = require('crypto');
var bodyParser = require('body-parser');

var models = require('./models');
var config = require(__dirname + '/config/security.json');


var app = express()

app.use(express.static('public'));
app.use(session({
  secret: config.session.secret,
  resave: false,
  saveUninitialized: true
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use ('/', function (req, res, next) {
  debug(req.path);
  if (req.method === 'POST' || req.method === 'PUT') {
    if(req.get('X-XSRF-TOKEN') == req.session.XSRFToken){
      debug('Token match.')
      next();
    } else {
      debug('Token mismatch.')
      res.send({success: false, error: "XSRF Token mismatch."})
    }
  } else if (req.method === 'GET' && (!req.cookies['XSRF-TOKEN'] || req.get('X-XSRF-TOKEN') != req.session.XSRFToken)) {
    debug('Get request missing CSRF token. Generating and saving...');
    var csrf = crypto.randomBytes(20).toString('hex');
    res.cookie('XSRF-TOKEN', csrf);
    req.session.XSRFToken = csrf;
    //generate and save CSRF token
    next();
  } else {
    next();
  }
});

//load user for api requests
app.use ('/api', function (req, res, next) {
  if(req.session.userID){
    models.User.find(req.session.userID).then(function(user) {
      req.user = user;
      next();
    });
  } else {
    next();
  }
});

app.use('/api/users', require('./api/user'));
app.use('/api/accounts', require('./api/account'));
app.use('/api/transaction', require('./api/transaction'));

app.route('/*').get(function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

models.sequelize.sync().then(function () {
  var server = app.listen(3000, function() {
    debug('Express server listening on port ' + server.address().port);
  });
});

