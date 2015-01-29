var models  = require('../../models');
var debug = require('debug')('ballistic');
var ACCOUNT = {General:1, Asset: 2, Liability: 3, Investment: 4}

exports.create = function(req, res) {
  debug(req.body)
  if(!req.body.name || !req.body.type || (req.body.type == ACCOUNT.Investment && !req.body.interest)){
    res.send({success: false, error: 'fields left empty'});
  } else {
    models.Account.create({ name: req.body.name, type: req.body.type, interest: req.body.interest}).then(function(account) {
      debug(account);
      res.send({success: true, account: account});
    });
  }
}
