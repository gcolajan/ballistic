var models  = require('../../models');
var debug = require('debug')('ballistic');
var validator = require('validator');

exports.update = function(req, res) {
  if(!req.body.currency || !req.body.goal || !req.body.age){
    res.send({success: false, error: 'fields left empty'});
  } else if (!validator.isNumeric(req.body.goal)) {
    res.send({success: false, error: 'goal must be a number'});
  } else if (!validator.isNumeric(req.body.age)) {
    res.send({success: false, error: 'age must be a number'});
  } else {
    req.user.getUserMetum().then(function(usermeta){
      if(usermeta){
        usermeta.currency = req.body.currency;
        usermeta.goal = req.body.goal;
        usermeta.age = req.body.age;
        usermeta.save().then(function (){
          res.send({success: true, usermeta: usermeta});
        });
      }
    });
  }
}