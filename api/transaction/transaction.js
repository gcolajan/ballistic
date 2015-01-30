var models  = require('../../models');
var debug = require('debug')('ballistic');
var TRANSACTION = {Spend:1, Income: 2, Purchase: 1, Depreciation: 2, Investment: 1, Interest: 2, Withdrawl: 3}

exports.create = function(req, res) {
  debug(req.body)
  if(!req.body.amount || !req.body.date || !req.body.type){
    res.send({success: false, error: 'fields left empty'});
  } else {
    models.Transaction.create({ amount: req.body.amount, date: req.body.date, type: req.body.type, description: req.body.description}).then(function(transaction) {
      transaction.setAccount(req.user);
      debug(transaction);
      res.send({success: true, transaction: transaction});
    });
  }
}

exports.list = function(req, res) {
  debug(req.body)
  if(!req.user){
    res.send({success: false, error: 'must be logged in'});
  } else {
    req.user.getAccounts().then(function(accounts) {
      debug(accounts);
      res.send({success: true, accounts: accounts});
    });
  }
}
