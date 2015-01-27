var models  = require('../../models');
var debug = require('debug')('ballistic');

exports.create = function(req, res) {
  debug(req.body)
  if(req.body.username && req.body.password){
    models.User.hash(req.body.password, function(err, hash){
      models.User.create({ username: req.body.username, password: hash }).then(function() {
        res.send({success: true});
      });
    });
  }
}
