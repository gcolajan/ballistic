var models  = require('../../models');
var debug = require('debug')('ballistic');
var validator = require('validator');

exports.update = function(req, res) {
  if(!req.body.currency || !req.body.goal || !req.body.age || (req.body.includeInflation && !req.body.inflation) || (req.body.depletingPrincipal && !req.body.lifeSpan)){
    res.send({success: false, error: 'fields left empty'});
  } else if (!validator.isFloat(req.body.goal)) {
    res.send({success: false, error: 'goal must be a number'});
  } else if (!validator.isNumeric(req.body.age)) {
    res.send({success: false, error: 'age must be a number'});
  } else if (req.body.includeInflation && !validator.isFloat(req.body.inflation)) {
    res.send({success: false, error: 'inflation must be a number'});
  } else if (req.body.depletingPrincipal && !validator.isNumeric(req.body.lifeSpan)) {
    res.send({success: false, error: 'life span must be a number'});
  } else if (req.body.depletingPrincipal && req.body.lifeSpan < req.body.age) {
    res.send({success: false, error: 'life span must be greater than age'});
  } else {
    req.user.getUserMetum().then(function(usermeta) {
      if (usermeta) {
        usermeta.currency = req.body.currency;
        usermeta.goal = req.body.goal;
        usermeta.age = req.body.age;
        usermeta.includeInflation = req.body.includeInflation;
        
        if (req.body.includeInflation) {
          usermeta.inflation = req.body.inflation;
        }
        
        usermeta.depletingPrincipal = req.body.depletingPrincipal;
        if (req.body.depletingPrincipal) {
          usermeta.lifeSpan = req.body.lifeSpan;
        }

        usermeta.save().then(function (){
          res.send({success: true, usermeta: usermeta});
        });
      }
    });
  }
}