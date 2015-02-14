var models  = require('../../../models');
var debug = require('debug')('ballistic');
var constants = require(__dirname + '/../../../config/constants.json');
var ACCOUNT = constants.ACCOUNT;
var TRANSACTION = constants.TRANSACTION;

module.exports.getAccountInfo = function (account, transactions, callback){
  var today = new Date();
  var sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1, 0, 0, 0, 0);

  account.getCategories().then(function(categories){
    generateLiabilityStatistics(account, null, function(liabilityStatistics){
      debug(liabilityStatistics);
      generateYearlyLiabilityStatistics(account, function(yearlyAssetStatistics){
        generateLiabilityDistributionStatistics(categories, liabilityStatistics, null, function(distributionStatistics){
          //get historical statistics
          generateHistoricalLiabilityStatistics(account, null, sixMonthsAgo, function(historicalSatistics){
            statistics = mergeObjects(liabilityStatistics, yearlyAssetStatistics);
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
  
  generateLiabilityStatistics(account, null, function(accountStatistics){
    generateYearlyLiabilityStatistics(account, function(accountYearlyStatistics){
      generateHistoricalLiabilityStatistics(account, null, sixMonthsAgo, function(historicalSatistics){
        var statistics = mergeObjects(accountStatistics, accountYearlyStatistics);
        statistics.historicalSatistics = historicalSatistics;
        callback(statistics);
      });
    });
  });
}

function generateLiabilityStatistics(account, date, callback){
  var statistics = {};
  if(date === null){
    date = new Date();
  }

  models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Debt, date: {lte: date.toDateString()}} }).then(function(totalDebt) {
    models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Payment, date: {lte: date.toDateString()}} }).then(function(totalPayments) {
      models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Interest, date: {lte: date.toDateString()}} }).then(function(totalInterest) {
        statistics.totalDebt = totalDebt || 0;
        statistics.totalPayments = totalPayments || 0;
        statistics.totalInterest = totalInterest || 0;
        statistics.balance = statistics.totalDebt + statistics.totalInterest - statistics.totalPayments;
        callback(statistics);
      });
    });
  });
}

function generateLiabilityDistributionStatistics(categories, liabilityStatistics, statistics, callback){
  if(statistics == null) {
    statistics = {
      count: 0,
      categories: []
    };
  }

  if(statistics.count < categories.length){
    models.Transaction.sum('amount', {where: {CategoryId: categories[statistics.count].id, type: [TRANSACTION.Debt, TRANSACTION.Interest]}}).then(function(categoryValue){
      models.Transaction.sum('amount', {where: {CategoryId: categories[statistics.count].id, type: TRANSACTION.Payment}}).then(function(categoryValuePaid){
        categoryValue = categoryValue || 0;
        categoryValuePaid = categoryValuePaid || 0;
        var value = categoryValue - categoryValuePaid;
        var percentOfDebt = (value / liabilityStatistics.balance) * 100;
        if(percentOfDebt > 0){
          statistics.categories.push({value: value, name: categories[statistics.count].name, percentage: percentOfDebt});
        }
        statistics.count++;
        generateLiabilityDistributionStatistics(categories, liabilityStatistics, statistics, callback);
      });
    });
  } else if (statistics.count == categories.length){
    models.Transaction.sum('amount', {where: {CategoryId: null, type: [TRANSACTION.Debt, TRANSACTION.Interest]}}).then(function(categoryValue){
      models.Transaction.sum('amount', {where: {CategoryId: null, type: TRANSACTION.Payment}}).then(function(categoryValuePaid){
        categoryValue = categoryValue || 0;
        categoryValuePaid = categoryValuePaid || 0;
        var value = categoryValue - categoryValuePaid;
        var percentOfDebt = (value / liabilityStatistics.balance) * 100;
        if(percentOfDebt > 0){
          statistics.categories.push({value: value, name: 'None', percentage: percentOfDebt});
        }
        statistics.count++;
        generateLiabilityDistributionStatistics(categories, liabilityStatistics, statistics, callback);
      });
    });
  } else {
    callback(statistics);
  }
}

function generateMonthlyAssetStatistics(account, date, callback){
  var statistics = {};
  var nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 0, 0, 0, 0);

  models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Debt, date: {gte: date.toDateString(), lte: nextMonth.toDateString()}} }).then(function(monthlyDebt) {
    models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Interest, date: {gte: date.toDateString(), lte: nextMonth.toDateString()}} }).then(function(monthlyInterest) {
      models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Payment, date: {gte: date.toDateString(), lte: nextMonth.toDateString()}} }).then(function(monthlyPayments) {
        statistics.monthlyDebt = monthlyDebt || 0;
        statistics.monthlyInterest = monthlyInterest || 0;
        statistics.monthlyPayments = monthlyPayments || 0;
        statistics.net = statistics.monthlyDebt + statistics.monthlyInterest - statistics.monthlyPayments;
        callback(statistics);
      });
    });
  });
}

function generateYearlyLiabilityStatistics(account, callback){
  var today = new Date();
  var yearStart = new Date(today.getFullYear(), 0, 0, 0, 0, 0, 0);
  var statistics = {};

  models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Debt, date: {gt: yearStart} } }).then(function(yearlyDebt) {
    models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Interest, date: {gt: yearStart} } }).then(function(yearlyInterest) {
      models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Payment, date: {gt: yearStart} } }).then(function(yearlyPayments) {
        statistics.yearlyDebt = yearlyDebt || 0;
        statistics.yearlyInterest = yearlyInterest || 0;
        statistics.yearlyPayments = yearlyPayments || 0;
        statistics.yearlyNet = statistics.yearlyDebt + statistics.yearlyInterest - statistics.yearlyPayments;
        callback(statistics);
      });
    });
  });
}

function generateHistoricalLiabilityStatistics(account, historicalSatistics, date, callback) {
  var today = new Date();
  var nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 0, 0, 0, 0);
  var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

  debug("historical investment loop");

  if(historicalSatistics === null){
    historicalSatistics = {debt: {data: []}, interest: {data: []}, payments: {data: []}, balance: {data: []}, labels: []};
    var lastMonth = new Date(date.getFullYear(), date.getMonth(), 0, 0, 0, 0, 0);
    generateLiabilityStatistics(account, lastMonth, function(statistics){
      debug(statistics)
      historicalSatistics.startingBalance = statistics.balance;
      generateHistoricalLiabilityStatistics(account, historicalSatistics, date, callback);
    });
  } else if(date < nextMonth){
    generateMonthlyAssetStatistics(account, date, function(statistics){
      nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0);
      debug(statistics);
      historicalSatistics.labels.push(monthNames[date.getMonth()]);
      historicalSatistics.debt.data.push(statistics.monthlyDebt);
      historicalSatistics.interest.data.push(statistics.monthlyInterest);
      historicalSatistics.payments.data.push(statistics.monthlyPayments);
      historicalSatistics.balance.data.push(statistics.net + historicalSatistics.startingBalance);
      historicalSatistics.startingBalance += statistics.net;
      generateHistoricalLiabilityStatistics(account, historicalSatistics, nextMonth, callback);
    });
  } else {
    callback(historicalSatistics);
  }
}

function mergeObjects(a, b) {
  for (var attrname in a) { b[attrname] = a[attrname]; }
  return b;
}