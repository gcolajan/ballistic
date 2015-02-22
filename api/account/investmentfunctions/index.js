var models  = require('../../../models');
var debug = require('debug')('ballistic');
var constants = require(__dirname + '/../../../config/constants.json');
var ACCOUNT = constants.ACCOUNT;
var TRANSACTION = constants.TRANSACTION;

module.exports.getAccountInfo = function (account, transactions, callback){
  var today = new Date();
  var sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1, 0, 0, 0, 0);

  account.getCategories().then(function(categories){
    generateInvestmentStatistics(account, null, function(investmentStatistics){
      generateYearlyInvestmentStatistics(account, function(yearlyInvestmentStatistics){
        generateInvestmentDistributionStatistics(categories, investmentStatistics, null, function(distributionStatistics){
          //get historical statistics
          generateHistoricalInvestmentStatistics(account, null, sixMonthsAgo, function(historicalSatistics){
            statistics = mergeObjects(investmentStatistics, yearlyInvestmentStatistics);
            statistics.distributionStatistics = distributionStatistics;
            callback(account, transactions, statistics, historicalSatistics);
          });
        });
      });
    });
  }); 
}

module.exports.generateAccountStatistics = function(account, callback){
  var today = new Date();
  var sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1, 0, 0, 0, 0);
  
  generateInvestmentStatistics(account, null, function(accountStatistics){
    generateYearlyInvestmentStatistics(account, function(accountYearlyStatistics){
      generateHistoricalInvestmentStatistics(account, null, sixMonthsAgo, function(historicalSatistics){
        var statistics = mergeObjects(accountStatistics, accountYearlyStatistics);
        statistics.historicalSatistics = historicalSatistics;
        callback(statistics);
      });
    });
  });
}

function generateInvestmentStatistics(account, date, callback){
  var statistics = {};
  if(date === null){
    date = new Date();
  }

  models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Investment, date: {lte: date.toDateString()}} }).then(function(totalInvestments) {
    models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Growth, date: {lte: date.toDateString()}} }).then(function(totalInterest) {
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

function generateInvestmentDistributionStatistics(categories, investmentStatistics, statistics, callback){
  if(statistics == null) {
    statistics = {
      count: 0,
      categories: []
    };
  }

  if(statistics.count < categories.length){
    models.Transaction.sum('amount', {where: {CategoryId: categories[statistics.count].id, type: [TRANSACTION.Investment, TRANSACTION.Growth]}}).then(function(investmentsAndGrowth){
      models.Transaction.sum('amount', {where: {CategoryId: categories[statistics.count].id, type: TRANSACTION.Withdrawal}}).then(function(withdrawals){
        investmentsAndGrowth = investmentsAndGrowth || 0;
        withdrawals = withdrawals || 0;

        var sum = investmentsAndGrowth - withdrawals;
        var percentOfInvestments = (sum / investmentStatistics.balance) * 100;
        if(percentOfInvestments > 0){
          statistics.categories.push({value: sum, name: categories[statistics.count].name, percentage: percentOfInvestments});
        }
        statistics.count++;
        generateInvestmentDistributionStatistics(categories, investmentStatistics, statistics, callback);
      });
    });
  } else if (statistics.count == categories.length && categories.length > 0){
    models.Transaction.sum('amount', {where: {CategoryId: null, type: [TRANSACTION.Investment, TRANSACTION.Growth], AccountId: categories[statistics.count - 1].AccountId}}).then(function(investmentsAndGrowth){
      models.Transaction.sum('amount', {where: {CategoryId: null, type: TRANSACTION.Withdrawal, AccountId: categories[statistics.count - 1].AccountId}}).then(function(withdrawals){
        investmentsAndGrowth = investmentsAndGrowth || 0;
        withdrawals = withdrawals || 0;
        
        var sum = investmentsAndGrowth - withdrawals;
        var percentOfInvestments = (sum / investmentStatistics.balance) * 100;
        if(percentOfInvestments > 0){
          statistics.categories.push({value: sum, name: 'None', percentage: percentOfInvestments});
        }
        statistics.count++;
        generateInvestmentDistributionStatistics(categories, investmentStatistics, statistics, callback);
      });
    });
  } else {
    callback(statistics);
  }
}

function generateMonthlyInvestmentStatistics(account, date, callback){
  var statistics = {};
  var nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 0, 0, 0, 0);

  models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Investment, date: {gte: date.toDateString(), lte: nextMonth.toDateString()}} }).then(function(monthlyInvestments) {
    models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Growth, date: {gte: date.toDateString(), lte: nextMonth.toDateString()}} }).then(function(monthlyInterest) {
      models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Withdrawal, date: {gte: date.toDateString(), lte: nextMonth.toDateString()}} }).then(function(monthlyWithdrawals) {
        statistics.monthlyInvestments = monthlyInvestments || 0;
        statistics.monthlyInterest = monthlyInterest || 0;
        statistics.monthlyWithdrawals = monthlyWithdrawals || 0;
        statistics.net = statistics.monthlyInvestments + statistics.monthlyInterest - statistics.monthlyWithdrawals;
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
      models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Growth, date: {gt: yearStart} } }).then(function(yearlyGrowth) {
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
      historicalSatistics.withdrawals.data.push(statistics.monthlyWithdrawals);
      historicalSatistics.interest.data.push(statistics.monthlyInterest);
      historicalSatistics.balance.data.push(statistics.net + historicalSatistics.startingBalance);
      historicalSatistics.startingBalance += statistics.net;
      generateHistoricalInvestmentStatistics(account, historicalSatistics, nextMonth, callback);
    });
    
  } else {
    callback(historicalSatistics);
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