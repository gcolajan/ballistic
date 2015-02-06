var models  = require('../../models');
var debug = require('debug')('ballistic');
var ACCOUNT = {General:1, Asset: 2, Liability: 3, Investment: 4};
var TRANSACTION = {Investment: 1, Interest: 2, Withdrawal: 3, Spend: 4, Income: 5, Purchase: 6, Depreciation: 7};

exports.create = function(req, res) {
  debug(req.body)
  if(!req.body.name || !req.body.type || (req.body.type == ACCOUNT.Investment && !req.body.interest)){
    res.send({success: false, error: 'fields left empty'});
  } else {
    models.Account.create({ name: req.body.name, type: req.body.type, interest: req.body.interest}).then(function(account) {
      if(req.body.category) {
        //models.Category.find()
      }
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
    var today = new Date();
    var sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1, 0, 0, 0, 0);
    debug(today)
    debug(sixMonthsAgo)

    models.Account.find(req.params.id).then(function(account) {
      account.getTransactions({ limit: 5, order: 'date DESC' }).then(function(transactions) {
        switch(account.type){
          case ACCOUNT.Investment:
            //get investment statistics
            generateInvestmentStatistics(account, null, function(investmentStatistics){
              generateYearlyInvestmentStatistics(account, function(yearlyInvestmentStatistics){
                //get historical statistics
                generateHistoricalInvestmentStatistics(account, null, sixMonthsAgo, function(historicalSatistics){
                  statistics = mergeObjects(investmentStatistics, yearlyInvestmentStatistics);
                  res.send({success: true, account: account, transactions: transactions, statistics: statistics, historicalStatistics: historicalSatistics});
                });
              });
            });
          break;
        }
      });
    });
  }
}

exports.statistics = function(req, res) {
  if(!req.user){
    res.send({success: false, error: 'must be logged in'});
  } else {
    req.user.getAccounts().then(function(accounts) {
      //recurses over accounts and calculates global and account stats
      generateUserStatistics(accounts, null, 0, function(accounts, statistics){
        for (var i = 0; i < accounts.length; ++i) {
          if(accounts[i].type == ACCOUNT.Investment){
            accounts[i].statistics.percentOfInvestments = accounts[i].statistics.balance / statistics.totalInvestments * 100;
            statistics.investmentInterest += accounts[i].statistics.percentOfInvestments * accounts[i].interest / 100;
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

function generateInvestmentStatistics(account, date, callback){
  var statistics = {};
  if(date === null){
    date = new Date();
  }

  models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Investment, date: {lte: date.toDateString()}} }).then(function(totalInvestments) {
    models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Interest, date: {lte: date.toDateString()}} }).then(function(totalInterest) {
      models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Withdrawal, date: {lte: date.toDateString()}} }).then(function(totalWithdrawals) {
        statistics.totalInvestments = totalInvestments || 0;
        statistics.totalInterest = totalInterest || 0;
        statistics.totalWithdrawals = totalWithdrawals || 0;
        statistics.balance = statistics.totalInvestments + statistics.totalInterest - statistics.totalWithdrawals;
        callback(statistics);
      });
    });
  });
}

function generateMonthlyInvestmentStatistics(account, date, callback){
  var statistics = {};
  var nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 0, 0, 0, 0);

  models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Investment, date: {gte: date.toDateString(), lte: nextMonth.toDateString()}} }).then(function(monthlyInvestments) {
    models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Interest, date: {gte: date.toDateString(), lte: nextMonth.toDateString()}} }).then(function(monthlyInterest) {
      models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Withdrawal, date: {gte: date.toDateString(), lte: nextMonth.toDateString()}} }).then(function(monthlyWithdrawls) {
        statistics.monthlyInvestments = monthlyInvestments || 0;
        statistics.monthlyInterest = monthlyInterest || 0;
        statistics.monthlyWithdrawls = monthlyWithdrawls || 0;
        statistics.net = statistics.monthlyInvestments + statistics.monthlyInterest - statistics.monthlyWithdrawls;
        callback(statistics);
      });
    });
  });
}



function generateYearlyInvestmentStatistics(account, callback){
  var today = new Date();
  var yearStart = new Date(today.getFullYear(), 0, 0, 0, 0, 0, 0);
  var statistics = {};
  var daysDifferent = dateDiffInDays(yearStart, today);

  models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Withdrawal, date: {gt: yearStart} } }).then(function(yearlyWithdrawals) {
    models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Investment, date: {gt: yearStart} } }).then(function(yearlyContributions) {
      models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Interest, date: {gt: yearStart} } }).then(function(yearlyGrowth) {
        statistics.yearlyWithdrawals = yearlyWithdrawals || 0;
        statistics.yearlyContributions = yearlyContributions || 0;
        statistics.yearlyGrowth = yearlyGrowth || 0;
        statistics.estimatedYearlyGrowth = ((statistics.yearlyContributions + statistics.yearlyGrowth - statistics.yearlyWithdrawals) / daysDifferent) * 365;
        callback(statistics);
      });
    });
  });
}

function generateHistoricalInvestmentStatistics(account, historicalSatistics, date, callback) {
  var today = new Date();
  var nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 0, 0, 0, 0);
  var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

  debug("historical investment loop");

  if(historicalSatistics === null){
    historicalSatistics = {contributions: {data: []}, withdrawals: {data: []}, interest: {data: []}, balance: {data: []}, labels: []};
    var lastMonth = new Date(date.getFullYear(), date.getMonth(), 0, 0, 0, 0, 0);
    generateInvestmentStatistics(account, lastMonth, function(statistics){
      debug(statistics)
      historicalSatistics.startingBalance = statistics.balance;
      generateHistoricalInvestmentStatistics(account, historicalSatistics, date, callback);
    });
  } else if(date < nextMonth){
    generateMonthlyInvestmentStatistics(account, date, function(statistics){
      nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0);
      debug(nextMonth);
      debug(statistics);
      historicalSatistics.labels.push(monthNames[date.getMonth()]);
      historicalSatistics.contributions.data.push(statistics.monthlyInvestments);
      historicalSatistics.withdrawals.data.push(statistics.monthlyWithdrawls);
      historicalSatistics.interest.data.push(statistics.monthlyInterest);
      historicalSatistics.balance.data.push(statistics.net + historicalSatistics.startingBalance);
      historicalSatistics.startingBalance += statistics.net;
      generateHistoricalInvestmentStatistics(account, historicalSatistics, nextMonth, callback);
    });
    
  } else {
    callback(historicalSatistics);
  }
}

function generateUserStatistics(accounts, statistics, index, callback){
  if(statistics === null){
    statistics = {
      netWorth: 0, 
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
      case ACCOUNT.Investment:
        generateInvestmentStatistics(accounts[index], null, function(accountStatistics){
          generateYearlyInvestmentStatistics(accounts[index], function(accountYearlyStatistics){
            accounts[index].statistics = mergeObjects(accountStatistics, accountYearlyStatistics);
            statistics.netWorth += accounts[index].statistics.balance;
            statistics.totalInvestments += accounts[index].statistics.balance;
            statistics.estimatedYearlyGrowth += accounts[index].statistics.estimatedYearlyGrowth;
            generateUserStatistics(accounts, statistics, ++index, callback);
          });
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

function dateDiffInDays(a, b) {
  // Discard the time and time-zone information.
  var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utc2 - utc1) / 86400000);
}

function mergeObjects(a, b) {
  for (var attrname in a) { b[attrname] = a[attrname]; }
  return b;
}