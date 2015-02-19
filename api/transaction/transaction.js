var models  = require('../../models');
var debug = require('debug')('ballistic');
var validator = require('validator');
var constants = require(__dirname + '/../../config/constants.json');
var ACCOUNT = constants.ACCOUNT;
var TRANSACTION = constants.TRANSACTION;

exports.create = function(req, res) {
  if (!req.body.accountID || !req.body.amount || !req.body.date || !req.body.type){
    res.send({success: false, error: 'fields left empty'});
  } else if (!validator.isDate(req.body.date)) {
    res.send({success: false, error: 'invalid date'});
  } else if (!validator.isFloat(req.body.amount)) {
    res.send({success: false, error: 'amount must be a number (no commas)'});
  } else {
    models.Account.find({where: {id: req.body.accountID, UserId: req.user.id}}).then(function(account){
      if(!account){
        res.send({success: false, error: 'account not found'});
      } else if(!req.body.category && (account.type == ACCOUNT.Investment || account.type == ACCOUNT.Asset || account.type == ACCOUNT.Liability)) {
        res.send({success: false, error: 'name field is required'});
      } else {
        models.Transaction.create({ amount: req.body.amount, date: req.body.date, type: req.body.type, description: req.body.description}).then(function(transaction) {
          transaction.setAccount(account).then(function(){
            createIfNotExistsAndAssociate(account, transaction, req.body.category, function(transaction){
              res.send({success: true, transaction: transaction});
            });
          });
        });
      }
    });
  }
}

exports.update = function(req, res) {
  if (!req.body.amount || !req.body.date || !req.body.type) {
    res.send({success: false, error: 'fields left empty'});
  } else if (!validator.isDate(req.body.date)) {
    res.send({success: false, error: 'invalid date'});
  } else if (!validator.isFloat(req.body.amount)) {
    res.send({success: false, error: 'amount must be a number (no commas)'});
  } else {
    models.Transaction.find({where: { id: req.params.id}, include: [ models.Category ]}).then(function(transaction){
      models.Account.find({where: {id: transaction.AccountId, UserId: req.user.id}}).then(function(account){
        transaction.amount = req.body.amount;
        transaction.date = req.body.date;
        transaction.type = req.body.type;
        transaction.description = req.body.description;
        transaction.save().then(function(){
          if (req.body.category) {
            createIfNotExistsAndAssociate(account, transaction, req.body.category, function(transaction){
              res.send({success: true, transaction: transaction});
            });
          } else {
            transaction.setCategory(null).then(function(){
              res.send({success: true, transaction: transaction});
            });
          }

          removeCategoryIfNotUsed(transaction.Category);
        });
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
  models.Transaction.find({where: { id: req.params.id}, include: [ models.Category ]}).then(function(transaction){
    transaction.destroy().then(function(){
      removeCategoryIfNotUsed(transaction.Category);
      res.send({success: true});
    });

    
  }); 
}

function createIfNotExistsAndAssociate(account, transaction, categoryName, callback) {
  if(categoryName) {
    models.Category.find({where: {AccountId: account.id, name: {ilike: categoryName}}}).then(function(category){
      if (!category) {
        models.Category.create({name: categoryName}).then(function(category){
          category.setAccount(account).then(function(){
            transaction.setCategory(category).then(function(){
              callback(transaction);
            });
          });
        });
      } else {
        transaction.setCategory(category);
        callback(transaction);
      }
    });
  } else {
    callback(transaction);
  }
}

function removeCategoryIfNotUsed(category){
  category.getTransactions(function(transactions) {
    if (!transactions) {
      category.destroy();
    }
  });
}