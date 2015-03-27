var models  = require('../../models');
var investmentFunctions  = require('./investmentfunctions');
var generalFunctions  = require('./generalfunctions');
var assetFunctions  = require('./assetfunctions');
var liabilityFunctions  = require('./liabilityfunctions');
var debug = require('debug')('ballistic');
var constants = require(__dirname + '/../../config/constants.json');
var ACCOUNT = constants.ACCOUNT;
var TRANSACTION = constants.TRANSACTION;

exports.create = function(req, res) {
  if (!req.body.name || !req.body.type || (req.body.type == ACCOUNT.Investment && !req.body.interest)) {
    res.send({success: false, error: 'fields left empty'});
  } else if (req.body.type != ACCOUNT.General && req.body.type != ACCOUNT.Asset && req.body.type != ACCOUNT.Liability && req.body.type != ACCOUNT.Investment) {
    res.send({success: false, error: 'invalid account type'});
  } else {
    models.Account.create({ name: req.body.name, type: req.body.type, interest: req.body.interest}).then(function(account) {
      account.setUser(req.user);
      res.send({success: true, account: account});
    });
  }
}

exports.update = function(req, res) {
  models.Account.find({where: {id: req.params.id, UserId: req.user.id}}).then(function(account) {
    if (!account) {
      res.send({success: false, error: 'account not found'});
    } else if (!req.body.name || (account.type == ACCOUNT.Investment && !req.body.interest)) {
      res.send({success: false, error: 'fields left empty'});
    } else {
      account.name = req.body.name;
      account.interest = req.body.interest;
      account.save().then(function(){
        res.send({success: true, account: account});
      });
    }
  });
}

exports.delete = function(req, res) {
  models.Account.find({where: {id: req.params.id, UserId: req.user.id}}).then(function(account) {
    if (!account) {
      res.send({success: false, error: 'account not found'});
    } else {
      models.Category.destroy({where: {AccountId: account.id}}).then(function(affectedCategories){
        console.log(affectedCategories);
        models.Transaction.destroy({where: {AccountId: account.id}}).then(function(affectedTransactions){
          console.log(affectedTransactions);
          account.destroy().then(function(){
            res.send({success: true});
          });
        });
      });
    }
  });
}

exports.get = function(req, res) {
  if (!req.user) {
    res.send({success: false, error: 'must be logged in'});
  } else {
    models.Account.find({include: [ models.Category ], where: {id: req.params.id, UserId: req.user.id}}).then(function(account) {
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
          case ACCOUNT.Liability:
            liabilityFunctions.getAccountInfo(account, transactions, function(account, transactions, statistics, historicalSatistics){
              res.send({success: true, account: account, transactions: transactions, statistics: statistics, historicalStatistics: historicalSatistics});
            });
          break;
        }
      });
    });
  }
}

function generateUserStatistics(accounts, statistics, index, callback){
  if (statistics === null) {
    statistics = {
      netWorth: 0, 
      totalAssets: 0,
      totalLiabilities: 0,
      totalInvestments: 0,
      investmentInterest: 0, 
      yearlyInvestmentIncome: 0,
      goalPercentage: 0,
      estimatedYearlyGrowth: 0,
      estimatedYearlyNetContributions: 0
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
          if(!statistics.historicalAssets){
            statistics.historicalAssets = accounts[index].statistics.historicalSatistics;
          } else {
            for (var i = statistics.historicalAssets.income.data.length - 1; i >= 0; i--) {
              statistics.historicalAssets.purchasesAndAppreciation.data[i] += accounts[index].statistics.historicalSatistics.purchasesAndAppreciation.data[i];
              statistics.historicalAssets.salesAndDepreciation.data[i] += accounts[index].statistics.historicalSatistics.salesAndDepreciation.data[i];
              statistics.historicalAssets.balance.data[i] += accounts[index].statistics.historicalSatistics.balance.data[i];
            };
          }
          generateUserStatistics(accounts, statistics, ++index, callback);
        });
      break;
      case ACCOUNT.Liability:
        liabilityFunctions.generateAccountStatistics(accounts[index], function(accountStatistics){
          accounts[index].statistics = accountStatistics;
          statistics.totalLiabilities += accounts[index].statistics.balance;
          statistics.netWorth -= accounts[index].statistics.balance;
          if(!statistics.historicalLiabilities){
            statistics.historicalLiabilities = accounts[index].statistics.historicalSatistics;
          } else {
            for (var i = statistics.historicalLiabilities.income.data.length - 1; i >= 0; i--) {
              statistics.historicalLiabilities.debt.data[i] += accounts[index].statistics.historicalSatistics.debt.data[i];
              statistics.historicalLiabilities.interest.data[i] += accounts[index].statistics.historicalSatistics.interest.data[i];
              statistics.historicalLiabilities.payments.data[i] += accounts[index].statistics.historicalSatistics.payments.data[i];
              statistics.historicalLiabilities.balance.data[i] += accounts[index].statistics.historicalSatistics.balance.data[i];
            };
          }
          generateUserStatistics(accounts, statistics, ++index, callback);
        });
      break;
      case ACCOUNT.Investment:
        investmentFunctions.generateAccountStatistics(accounts[index], function(accountStatistics){
          accounts[index].statistics = accountStatistics;
          statistics.netWorth += accounts[index].statistics.balance;
          statistics.totalInvestments += accounts[index].statistics.balance;
          statistics.estimatedYearlyGrowth += accounts[index].statistics.estimatedYearlyGrowth;
          statistics.estimatedYearlyNetContributions += accounts[index].statistics.estimatedYearlyNetContributions
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
  if (!req.user) {
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
  var inflation;

  if (!req.user) {
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
          else if(accounts[i].type == ACCOUNT.Liability){
            accounts[i].statistics.percentOfLiabilities = accounts[i].statistics.balance / statistics.totalLiabilities * 100;
          }
        }

        if(req.usermeta.includeInflation) {
          inflation = req.usermeta.inflation;
        } else {
          inflation = 0;
        }
        if(req.usermeta.depletingPrincipal) {
          remainingLife = req.usermeta.lifeSpan - req.usermeta.age;
        } else {
          remainingLife = null;
        }

        statistics.yearlyInvestmentIncome = statistics.totalInvestments * (statistics.investmentInterest / 100);
        recursiveStatistics = estimateMonthsRemaining(statistics.totalInvestments, statistics.estimatedYearlyNetContributions / 12, Number(req.usermeta.goal), statistics.investmentInterest, inflation, remainingLife * 12,  0);
        statistics.realGoal = recursiveStatistics.goalAmount;
        statistics.investmentGoal = recursiveStatistics.neededAmount;
        statistics.goalPercentage = statistics.totalInvestments / statistics.investmentGoal * 100;
        statistics.estimatedMonthsRemaining = recursiveStatistics.monthsRemaining;
        statistics.estimatedYearsRemaining = statistics.estimatedMonthsRemaining / 12;
        statistics.goalAge = req.usermeta.age + statistics.estimatedYearsRemaining;
        res.send({success: true, accounts: accounts, statistics: statistics});
      });
    });
  }
}

function estimateMonthsRemaining(currentAmount, monthlyContribution, goalAmount, interest, inflation, remainingLife, count){
  goalAmount = goalAmount + goalAmount * (inflation / 100 / 12);
  var neededAmount = goalAmount / ((interest - inflation) / 100);
  var depletingPrincipalRetirement = false;

  if(remainingLife){
    remainingLife--;
    if(remainingLife % 6 == 0){
      depletingPrincipalRetirement = depletingPrincipalTest(currentAmount, goalAmount, interest, inflation, remainingLife);
    }
  }

  if (currentAmount > neededAmount || count >= 2400 || depletingPrincipalRetirement) {
    statistics = {goalAmount: goalAmount, neededAmount: neededAmount, monthsRemaining: count}
    return statistics;
  } else {
    currentAmount += monthlyContribution;
    currentAmount += currentAmount * (interest / 100 / 12);
    return estimateMonthsRemaining(currentAmount, monthlyContribution, goalAmount, interest, inflation, remainingLife, count + 1);
  }
}

function depletingPrincipalTest(currentAmount, goalAmount, interest, inflation, remainingLife) {
  goalAmount = goalAmount + goalAmount * (inflation / 100 / 12);
  remainingLife--;

  if (currentAmount < 0) {
    return (remainingLife <= 0);
  } else {
    currentAmount -= goalAmount / 12;
    currentAmount += currentAmount * (interest / 100 / 12);
    return depletingPrincipalTest(currentAmount, goalAmount, interest, inflation, remainingLife);
  }
}
