var models  = require('../../models');
var debug = require('debug')('ballistic');
var validator = require('validator');

exports.create = function(req, res) {
  if (!req.body.accountID || !req.body.amount || !req.body.date || !req.body.type){
    res.send({success: false, error: 'fields left empty'});
  } else if (!validator.isDate(req.body.date)) {
    res.send({success: false, error: 'invalid date'});
  } else if (!validator.isNumeric(req.body.amount)) {
    res.send({success: false, error: 'amount must be a number'});
  } else {
    models.Account.find({where: {id: req.body.accountID, UserId: req.user.id}}).then(function(account){
      if(!account){
        res.send({success: false, error: 'account not found'});
      } else {
        models.Transaction.create({ amount: req.body.amount, date: req.body.date, type: req.body.type, description: req.body.description}).then(function(transaction) {
          transaction.setAccount(account);

          if(req.body.category) {
            models.Category.find({where: {AccountId: account.id, name: {ilike: req.body.category}}}).then(function(category){
              if (!category) {
                models.Category.create({name: req.body.category}).then(function(category){
                  category.setAccount(account);
                  transaction.setCategory(category);
                  res.send({success: true, transaction: transaction});
                });
              } else {
                transaction.setCategory(category);
                res.send({success: true, transaction: transaction});
              }
            });
          } else {
            res.send({success: true, transaction: transaction});
          }
        });
      }
    });
  }
}

exports.update = function(req, res) {
  debug(req.body)
  if (!req.body.amount || !req.body.date || !req.body.type) {
    res.send({success: false, error: 'fields left empty'});
  } else if (!validator.isDate(req.body.date)) {
    res.send({success: false, error: 'invalid date'});
  } else if (!validator.isNumeric(req.body.amount)) {
    res.send({success: false, error: 'amount must be a number'});
  } else {
    models.Transaction.find(req.params.id).then(function(transaction){
      transaction.amount = req.body.amount;
      transaction.date = req.body.date;
      transaction.type = req.body.type;
      transaction.save().then(function(transaction){
        res.send({success: true, transaction: transaction})
      });
    });
  }
}

exports.get = function(req, res) {
  models.Transaction.find(req.params.id).then(function(transaction){
    if(!transaction){
      res.send({success: false, error: 'transaction not found'});
    } else {
      res.send({success: true, transaction: transaction});
    }
  }); 
}

exports.delete = function(req, res) {
  models.Transaction.find(req.params.id).then(function(transaction){
    transaction.destroy().then(function(){
      res.send({success: true});
    });
  }); 
}