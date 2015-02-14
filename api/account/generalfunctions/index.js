var models  = require('../../../models');
var debug = require('debug')('ballistic');
var constants = require(__dirname + '/../../../config/constants.json');
var ACCOUNT = constants.ACCOUNT;
var TRANSACTION = constants.TRANSACTION;

module.exports.getAccountInfo = function (account, transactions, callback){
  var today = new Date();
  var sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1, 0, 0, 0, 0);
  var lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1, 0, 0, 0, 0);

  account.getCategories().then(function(categories){
    generateGeneralStatistics(account, null, function(generalStatistics){
      generateYearlyGeneralStatistics(account, function(yearlyGeneralStatistics){
        generateMonthlyGeneralStatistics(account, lastMonth, function(lastMonthStatistics){
          generateGeneralDistributionStatistics(categories, lastMonthStatistics, lastMonth, null, function(distributionStatistics){
            //get historical statistics
            generateHistoricalGeneralStatistics(account, null, sixMonthsAgo, function(historicalSatistics){
              statistics = mergeObjects(generalStatistics, yearlyGeneralStatistics);
              statistics.distributionStatistics = distributionStatistics;
              callback(account, transactions, statistics, historicalSatistics);
            });
          });
        });
      });
    });
  });
}

module.exports.generateAccountStatistics = function(account, callback){
  var today = new Date();
  var sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1, 0, 0, 0, 0);

  generateGeneralStatistics(account, null, function(accountStatistics){
    generateYearlyGeneralStatistics(account, function(accountYearlyStatistics){
      generateHistoricalGeneralStatistics(account, null, sixMonthsAgo, function(historicalSatistics){
        var statistics = mergeObjects(accountStatistics, accountYearlyStatistics);
        statistics.historicalSatistics = historicalSatistics;
        callback(statistics);
      });
    });
  });
}

function generateGeneralStatistics(account, date, callback){
  var statistics = {};
  if(date === null){
    date = new Date();
  }

  models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Income, date: {lte: date.toDateString()}} }).then(function(totalIncome) {
    models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Spend, date: {lte: date.toDateString()}} }).then(function(totalSpend) {
      statistics.totalIncome = totalIncome || 0;
      statistics.totalSpend = totalSpend || 0;
      statistics.balance = statistics.totalIncome - statistics.totalSpend;
      callback(statistics);
    });
  });
}

function generateGeneralDistributionStatistics(categories, generalStatistics, date, statistics, callback){
  if(statistics == null) {
    statistics = {
      count: 0,
      categories: []
    };
  }

  var nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 0, 0, 0, 0);

  if(statistics.count < categories.length){
    models.Transaction.sum('amount', {where: {CategoryId: categories[statistics.count].id, type: TRANSACTION.Spend, date: {gte: date.toDateString(), lte: nextMonth.toDateString()}}}).then(function(sum){
      var percentOfSpend = (sum / generalStatistics.monthlySpend) * 100;
      debug(percentOfSpend);
      if(percentOfSpend > 0) {
        statistics.categories.push({value: sum, name: categories[statistics.count].name, percentage: percentOfSpend});
      } 
      statistics.count++;
      generateGeneralDistributionStatistics(categories, generalStatistics, date, statistics, callback);
    });
  } else if (statistics.count == categories.length && categories.length > 0){
    models.Transaction.sum('amount', {where: {CategoryId: null, type: TRANSACTION.Spend, date: {gte: date.toDateString(), lte: nextMonth.toDateString()}, AccountId: categories[statistics.count - 1].AccountId}}).then(function(sum){
      var percentOfSpend = (sum / generalStatistics.monthlySpend) * 100;
      if(percentOfSpend > 0) {
        statistics.categories.push({value: sum, name: 'None', percentage: percentOfSpend});
      }
      statistics.count++;
      generateGeneralDistributionStatistics(categories, generalStatistics, date, statistics, callback);
    });
  } else {
    callback(statistics);
  }
}

function generateMonthlyGeneralStatistics(account, date, callback){
  var statistics = {};
  var nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 0, 0, 0, 0);

  models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Income, date: {gte: date.toDateString(), lte: nextMonth.toDateString()}} }).then(function(monthlyIncome) {
    models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Spend, date: {gte: date.toDateString(), lte: nextMonth.toDateString()}} }).then(function(monthlySpend) {
      statistics.monthlyIncome = monthlyIncome || 0;
      statistics.monthlySpend = monthlySpend || 0;
      statistics.net = statistics.monthlyIncome - statistics.monthlySpend;
      callback(statistics);
    });
  });
}

function generateYearlyGeneralStatistics(account, callback){
  var today = new Date();
  var yearStart = new Date(today.getFullYear(), 0, 0, 0, 0, 0, 0);
  var statistics = {};

  models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Income, date: {gt: yearStart} } }).then(function(yearlyIncome) {
    models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Spend, date: {gt: yearStart} } }).then(function(yearlySpend) {
      statistics.yearlyIncome = yearlyIncome || 0;
      statistics.yearlySpend = yearlySpend || 0;
      callback(statistics);
    });
  });
}

function generateHistoricalGeneralStatistics(account, historicalSatistics, date, callback) {
  var today = new Date();
  var nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 0, 0, 0, 0);
  var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

  debug("historical investment loop");

  if(historicalSatistics === null){
    historicalSatistics = {income: {data: []}, spend: {data: []}, balance: {data: []}, labels: []};
    var lastMonth = new Date(date.getFullYear(), date.getMonth(), 0, 0, 0, 0, 0);
    generateGeneralStatistics(account, lastMonth, function(statistics){
      historicalSatistics.startingBalance = statistics.balance;
      generateHistoricalGeneralStatistics(account, historicalSatistics, date, callback);
    });
  } else if(date < nextMonth){
    generateMonthlyGeneralStatistics(account, date, function(statistics){
      nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0);
      historicalSatistics.labels.push(monthNames[date.getMonth()]);
      historicalSatistics.income.data.push(statistics.monthlyIncome);
      historicalSatistics.spend.data.push(statistics.monthlySpend);
      historicalSatistics.balance.data.push(statistics.net + historicalSatistics.startingBalance);
      historicalSatistics.startingBalance += statistics.net;
      generateHistoricalGeneralStatistics(account, historicalSatistics, nextMonth, callback);
    });
    
  } else {
    callback(historicalSatistics);
  }
}

function mergeObjects(a, b) {
  for (var attrname in a) { b[attrname] = a[attrname]; }
  return b;
}