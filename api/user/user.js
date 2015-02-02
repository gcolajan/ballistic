var models  = require('../../models');
var debug = require('debug')('ballistic');

exports.create = function(req, res) {
  debug(req.body)
  if(req.body.username && req.body.password){
    models.User.hash(req.body.password, function(err, hash){
      models.User.create({ username: req.body.username, password: hash }).then(function(user) {
        models.UserMeta.create({}).then(function(usermeta){
          usermeta.setUser(user);
        });
        res.send({success: true, user: {id: user.id}});
      });
    });
  }
}

exports.authenticate = function(req, res) {
  debug(req.body)
  if(req.body.username && req.body.password){
    models.User.find({ where: {username: {ilike: req.body.username}} }).then(function(user) {
      console.log(user)
      models.User.checkPassword(req.body.password, user.password, function(err, match) {
        if(match){
          debug('authenticated');
          req.session.userID = user.id;
          res.send({success: true, user: {id: user.id, username: user.username}});
        } else {
          debug('password did not match');
          res.send({success: false, error: 'password did not match'});
        }
      });
    });
  }
}

exports.session = function(req, res) {
  if(req.user){
    res.send({success: true, user: {id: req.user.id, username: req.user.username}});
  } else {
    debug('session expired');
    res.send({success: false, error: 'session expired'});
  }
}

exports.logout = function(req, res) {
  if(req.user){
    req.session.userID = null;
    res.send({success: true});
  } else {
    res.send({success: false, error: 'session expired'});
  }
}
