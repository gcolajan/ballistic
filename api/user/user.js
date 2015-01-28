var models  = require('../../models');
var debug = require('debug')('ballistic');

exports.create = function(req, res) {
  debug(req.body)
  if(req.body.username && req.body.password){
    models.User.hash(req.body.password, function(err, hash){
      models.User.create({ username: req.body.username, password: hash }).then(function(user) {
        debug(user);
        res.send({success: true, user: {id: user.id}});
      });
    });
  }
}

exports.authenticate = function(req, res) {
  debug(req.body)
  if(req.body.username && req.body.password){
    models.User.find({ where: {username: req.body.username} }).then(function(user) {
      models.User.checkPassword(req.body.password, user.password, function(err, match) {
        if(match){
          debug('authenticated');
          res.send({success: true, user: {id: user.id}});
        } else {
          debug('password did not match');
          res.send({success: false, error: 'password did not match'});
        }
      });
    });
  }
}
