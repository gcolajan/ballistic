var models  = require('../../models');
var debug = require('debug')('ballistic');

exports.update = function(req, res) {
  debug(req.body)
  if(req.body.currency && req.body.goal && req.body.age){
    req.user.getUserMetum().then(function(usermeta){
      usermeta.currency = req.body.currency;
      usermeta.goal = req.body.goal;
      usermeta.age = req.body.age;
      usermeta.save().then(function (){
        res.send({success: true, usermeta: usermeta});
      });
    });
    
  }
}