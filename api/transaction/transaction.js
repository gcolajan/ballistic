var models  = require('../../models');
var debug = require('debug')('ballistic');
var TRANSACTION = {Spend:1, Income: 2, Purchase: 1, Depreciation: 2, Investment: 1, Interest: 2, Withdrawl: 3}

exports.create = function(req, res) {
  debug(req.body)
  if(!req.body.accountID || !req.body.amount || !req.body.date || !req.body.type){
    res.send({success: false, error: 'fields left empty'});
  } else {
    models.Transaction.create({ amount: req.body.amount, date: req.body.date, type: req.body.type, description: req.body.description}).then(function(transaction) {
      models.Account.find(req.body.accountID).then(function(account){
        transaction.setAccount(account);
        debug(transaction);
        res.send({success: true, transaction: transaction});
      });
    });
  }
}

exports.update = function(req, res) {
  debug(req.body)
  if(!req.body.amount || !req.body.date || !req.body.type){
    res.send({success: false, error: 'fields left empty'});
  } else {
    models.Transaction.find(req.params.id).then(function(transaction){
      transaction.amount = req.body.amount;
      transaction.date = req.body.date;
      transaction.type = req.body.type;
      transaction.save().then(function(transaction){
        req.send({success: true, transaction: transaction})
      });
    });
  }
}

exports.get = function(req, res) {
  models.Transaction.find(req.params.id).then(function(transaction){
    req.send({success: true, transaction: transaction})
  }); 
}