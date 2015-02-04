var models  = require('../../models');
var debug = require('debug')('ballistic');
var ACCOUNT = {General:1, Asset: 2, Liability: 3, Investment: 4}
var TRANSACTION = {Spend:1, Income: 2, Purchase: 1, Depreciation: 2, Investment: 1, Interest: 2, Withdrawal: 3}

exports.create = function(req, res) {
  debug(req.body)
  if(!req.body.name || !req.body.type || (req.body.type == ACCOUNT.Investment && !req.body.interest)){
    res.send({success: false, error: 'fields left empty'});
  } else {
    models.Account.create({ name: req.body.name, type: req.body.type, interest: req.body.interest}).then(function(account) {
      account.setUser(req.user);
      debug(account);
      res.send({success: true, account: account});
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

exports.get = function(req, res) {
  if(!req.user){
    res.send({success: false, error: 'must be logged in'});
  } else {
    models.Account.find(req.params.id).then(function(account) {
      account.getTransactions().then(function(transactions) {
        switch(account.type){
          case ACCOUNT.Investment:
            generateInvestmentStatistics(account, transactions, function(statistics){
              res.send({success: true, account: account, transactions: transactions, statistics: statistics});
            });
          break;
        }
      });
    });
  }
}

function generateInvestmentStatistics(account, transactions, callback){
  var today = new Date();
  var yearStart = new Date(today.getFullYear(), 1, 1, 0, 0, 0, 1);
  var statistics = {};

  models.Transaction.sum('amount', { where: { AccountId:  account.id, type: {ne: TRANSACTION.Withdrawal}} }).then(function(totalDeposits) {
    models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Withdrawal} }).then(function(totalWithdrawals) {
      models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Withdrawal, date: {gt: yearStart} } }).then(function(yearlyWithdrawals) {
        models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Investment, date: {gt: yearStart} } }).then(function(yearlyContributions) {
          models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Interest, date: {gt: yearStart} } }).then(function(yearlyGrowth) {
            statistics.totalDeposits = totalDeposits || 0;
            statistics.totalWithdrawals = totalWithdrawals || 0;
            statistics.balance = statistics.totalDeposits - statistics.totalWithdrawals;
            statistics.yearlyWithdrawals = yearlyWithdrawals || 0;
            statistics.yearlyContributions = yearlyContributions || 0;
            statistics.yearlyGrowth = yearlyGrowth || 0;
            callback(statistics);
          });
        });
      });
    });
  });
}