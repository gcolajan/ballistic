var models  = require('../../models');
var investmentFunctions  = require('./investmentfunctions');
var generalFunctions  = require('./generalfunctions');
var assetFunctions  = require('./assetfunctions');
var debug = require('debug')('ballistic');
var constants = require(__dirname + '/../../config/constants.json');
var ACCOUNT = constants.ACCOUNT;
var TRANSACTION = constants.TRANSACTION;

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
    models.Account.find({where: {id: req.params.id, UserId: req.user.id}}).then(function(account) {
      account.getTransactions({ include: [ models.Category ], limit: 5, order: 'date DESC' }).then(function(transactions) {
        switch(account.type){
          case ACCOUNT.Investment:
            investmentFunctions.getAccountInfo(account, transactions, function(account, transactions, statistics, historicalSatistics){
              res.send({success: true, account: account, transactions: transactions, statistics: statistics, historicalStatistics: historicalSatistics});
            });
          break;
          case ACCOUNT.General:
            generalFunctions.getAccountInfo(account, transactions, function(account, transactions, statistics, historicalSatistics){
              res.send({success: true, account: account, transactions: transactions, statistics: statistics, historicalStatistics: historicalSatistics});
            });
          break;
          case ACCOUNT.Asset:
            assetFunctions.getAccountInfo(account, transactions, function(account, transactions, statistics, historicalSatistics){
              res.send({success: true, account: account, transactions: transactions, statistics: statistics, historicalStatistics: historicalSatistics});
            });
          break;
        }
      });
    });
  }
}

function generateUserStatistics(accounts, statistics, index, callback){
  if(statistics === null){
    statistics = {
      netWorth: 0, 
      totalAssets: 0,
      totalInvestments: 0,
      investmentInterest: 0, 
      yearlyInvestmentIncome: 0,
      goalPercentage: 0,
      estimatedYearlyGrowth: 0
    };
  }
  
  if (index < accounts.length) {
    accounts[index] = accounts[index].values;
    switch(accounts[index].type){
      case ACCOUNT.General:
        generalFunctions.generateAccountStatistics(accounts[index], function(accountStatistics){
          accounts[index].statistics = accountStatistics;
          statistics.netWorth += accounts[index].statistics.balance;
          if(!statistics.historicalIncomeSpend){
            statistics.historicalIncomeSpend = accounts[index].statistics.historicalSatistics;
          } else {
            for (var i = statistics.historicalIncomeSpend.income.data.length - 1; i >= 0; i--) {
              statistics.historicalIncomeSpend.income.data[i] += accounts[index].statistics.historicalSatistics.income.data[i];
              statistics.historicalIncomeSpend.spend.data[i] += accounts[index].statistics.historicalSatistics.spend.data[i];
              statistics.historicalIncomeSpend.balance.data[i] += accounts[index].statistics.historicalSatistics.balance.data[i];
            };
          }
          generateUserStatistics(accounts, statistics, ++index, callback);
        });
      break;
      case ACCOUNT.Asset:
        assetFunctions.generateAccountStatistics(accounts[index], function(accountStatistics){
          accounts[index].statistics = accountStatistics;
          statistics.totalAssets += accounts[index].statistics.balance;
          statistics.netWorth += accounts[index].statistics.balance;
          // if(!statistics.historicalIncomeSpend){
          //   statistics.historicalIncomeSpend = accounts[index].statistics.historicalSatistics;
          // } else {
          //   for (var i = statistics.historicalIncomeSpend.income.data.length - 1; i >= 0; i--) {
          //     statistics.historicalIncomeSpend.income.data[i] += accounts[index].statistics.historicalSatistics.income.data[i];
          //     statistics.historicalIncomeSpend.spend.data[i] += accounts[index].statistics.historicalSatistics.spend.data[i];
          //     statistics.historicalIncomeSpend.balance.data[i] += accounts[index].statistics.historicalSatistics.balance.data[i];
          //   };
          // }
          generateUserStatistics(accounts, statistics, ++index, callback);
        });
      break;
      case ACCOUNT.Investment:
        investmentFunctions.generateAccountStatistics(accounts[index], function(accountStatistics){
          accounts[index].statistics = accountStatistics;
          statistics.netWorth += accounts[index].statistics.balance;
          statistics.totalInvestments += accounts[index].statistics.balance;
          statistics.estimatedYearlyGrowth += accounts[index].statistics.estimatedYearlyGrowth;
          if(!statistics.historicalInvestments){
            statistics.historicalInvestments = accounts[index].statistics.historicalSatistics;
          } else {
            for (var i = statistics.historicalInvestments.contributions.data.length - 1; i >= 0; i--) {
              statistics.historicalInvestments.contributions.data[i] += accounts[index].statistics.historicalSatistics.contributions.data[i];
              statistics.historicalInvestments.withdrawals.data[i] += accounts[index].statistics.historicalSatistics.withdrawals.data[i];
              statistics.historicalInvestments.interest.data[i] += accounts[index].statistics.historicalSatistics.interest.data[i];
              statistics.historicalInvestments.balance.data[i] += accounts[index].statistics.historicalSatistics.balance.data[i];
            };
          }
          generateUserStatistics(accounts, statistics, ++index, callback);
        });
      break;
      default:
        generateUserStatistics(accounts, statistics, ++index, callback);
      break;
    }
  } else {
    callback(accounts, statistics);
  }
}

exports.getTransactions = function(req, res) {
  if(!req.user){
    res.send({success: false, error: 'must be logged in'});
  } else {
    models.Account.find({where: {id: req.params.id, UserId: req.user.id}}).then(function(account) {
      account.getTransactions({ include: [ models.Category ], order: 'date DESC' }).then(function(transactions) {
        res.send({success: true, account: account, transactions: transactions});
      });
    });
  }
}

exports.statistics = function(req, res) {
  if(!req.user){
    res.send({success: false, error: 'must be logged in'});
  } else {
    req.user.getAccounts().then(function(accounts) {
      generateUserStatistics(accounts, null, 0, function(accounts, statistics){
        for (var i = 0; i < accounts.length; ++i) {
          if(accounts[i].type == ACCOUNT.Investment){
            accounts[i].statistics.percentOfInvestments = accounts[i].statistics.balance / statistics.totalInvestments * 100;
            statistics.investmentInterest += accounts[i].statistics.percentOfInvestments * accounts[i].interest / 100;
          } else if(accounts[i].type == ACCOUNT.Asset){
            accounts[i].statistics.percentOfAssets = accounts[i].statistics.balance / statistics.totalAssets * 100;
          }
        }
        statistics.investmentGoal = req.usermeta.goal / (statistics.investmentInterest / 100);
        statistics.goalPercentage = statistics.totalInvestments / statistics.investmentGoal * 100;
        statistics.yearlyInvestmentIncome = statistics.totalInvestments * (statistics.investmentInterest / 100);
        statistics.estimatedMonthsRemaining = estimateMonthsRemaining(statistics.totalInvestments, statistics.estimatedYearlyGrowth / 12, statistics.investmentGoal, statistics.investmentInterest / 100, 0);
        statistics.estimatedYearsRemaining = statistics.estimatedMonthsRemaining / 12;
        statistics.goalAge = req.usermeta.age + statistics.estimatedYearsRemaining;
        res.send({success: true, accounts: accounts, statistics: statistics});
      });
    });
  }
}

function estimateMonthsRemaining(currentAmount, monthlyContribution, goalAmount, interest, count){
  if(count < 2400){
    if(currentAmount > goalAmount){
      return count;
    } else {
      return estimateMonthsRemaining(currentAmount + monthlyContribution + (monthlyContribution * interest), monthlyContribution, goalAmount, interest, count + 1);
    }
  } else {
    return count;
  }
}
