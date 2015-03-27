var models  = require('../../../models');
var debug = require('debug')('ballistic');
var constants = require(__dirname + '/../../../config/constants.json');
var ACCOUNT = constants.ACCOUNT;
var TRANSACTION = constants.TRANSACTION;

module.exports.getAccountInfo = function (account, transactions, callback){
  var today = new Date();
  var sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1, 0, 0, 0, 0);

  account.getCategories().then(function(categories){
    generateAssetStatistics(account, null, function(assetStatistics){
      debug(assetStatistics);
      generateYearlyAssetStatistics(account, function(yearlyAssetStatistics){
        generateAssetDistributionStatistics(categories, assetStatistics, null, function(distributionStatistics){
          //get historical statistics
          generateHistoricalAssetStatistics(account, null, sixMonthsAgo, function(historicalSatistics){
            statistics = mergeObjects(assetStatistics, yearlyAssetStatistics);
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
  
  generateAssetStatistics(account, null, function(accountStatistics){
    generateYearlyAssetStatistics(account, function(accountYearlyStatistics){
      generateHistoricalAssetStatistics(account, null, sixMonthsAgo, function(historicalSatistics){
        var statistics = mergeObjects(accountStatistics, accountYearlyStatistics);
        statistics.historicalSatistics = historicalSatistics;
        callback(statistics);
      });
    });
  });
}

function generateAssetStatistics(account, date, callback){
  var statistics = {};
  if(date === null){
    date = new Date();
  }

  models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Purchase, date: {lte: date.toDateString()}} }).then(function(totalPurchases) {
    models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Sale, date: {lte: date.toDateString()}} }).then(function(totalSales) {
      models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Appreciation, date: {lte: date.toDateString()}} }).then(function(totalAppreciation) {
        models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Depreciation, date: {lte: date.toDateString()}} }).then(function(totalDepreciation) {
          statistics.totalPurchases = totalPurchases || 0;
          statistics.totalSales = totalSales || 0;
          statistics.totalAppreciation = totalAppreciation || 0;
          statistics.totalDepreciation = totalDepreciation || 0;
          statistics.balance = statistics.totalPurchases + statistics.totalAppreciation - statistics.totalSales - statistics.totalDepreciation;
          callback(statistics);
        });
      });
    });
  });
}

function generateAssetDistributionStatistics(categories, assetStatistics, statistics, callback){
  if(statistics == null) {
    statistics = {
      count: 0,
      categories: []
    };
  }

  if(statistics.count < categories.length){
    models.Transaction.sum('amount', {where: {CategoryId: categories[statistics.count].id, type: [TRANSACTION.Purchase, TRANSACTION.Appreciation]}}).then(function(categoryValue){
      models.Transaction.sum('amount', {where: {CategoryId: categories[statistics.count].id, type: [TRANSACTION.Sale, TRANSACTION.Depreciation]}}).then(function(categoryValueLost){
        categoryValue = categoryValue || 0;
        categoryValueLost = categoryValueLost || 0;
        var value = categoryValue - categoryValueLost;
        var percentOfAssets = (value / assetStatistics.balance) * 100;
        if(percentOfAssets > 0){
          statistics.categories.push({value: value, name: categories[statistics.count].name, percentage: percentOfAssets});
        }
        statistics.count++;
        generateAssetDistributionStatistics(categories, assetStatistics, statistics, callback);
      });
    });
  } else if (statistics.count == categories.length && categories.length > 0){
    models.Transaction.sum('amount', {where: {CategoryId: null, type: [TRANSACTION.Purchase, TRANSACTION.Appreciation], AccountId: categories[statistics.count - 1].AccountId}}).then(function(categoryValue){
      models.Transaction.sum('amount', {where: {CategoryId: null, type: [TRANSACTION.Sale, TRANSACTION.Depreciation], AccountId: categories[statistics.count - 1].AccountId}}).then(function(categoryValueLost){
        categoryValue = categoryValue || 0;
        categoryValueLost = categoryValueLost || 0;
        var value = categoryValue - categoryValueLost;
        var percentOfAssets = (value / assetStatistics.balance) * 100;
        if(percentOfAssets > 0){
          statistics.categories.push({value: value, name: 'None', percentage: percentOfAssets});
        }
        statistics.count++;
        generateAssetDistributionStatistics(categories, assetStatistics, statistics, callback);
      });
    });
  } else {
    callback(statistics);
  }
}

function generateMonthlyAssetStatistics(account, date, callback){
  var statistics = {};
  var nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 0, 0, 0, 0);

  models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Purchase, date: {gte: date.toDateString(), lte: nextMonth.toDateString()}} }).then(function(monthlyPurchases) {
    models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Sale, date: {gte: date.toDateString(), lte: nextMonth.toDateString()}} }).then(function(monthlySales) {
      models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Appreciation, date: {gte: date.toDateString(), lte: nextMonth.toDateString()}} }).then(function(monthlyAppreciation) {
        models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Depreciation, date: {gte: date.toDateString(), lte: nextMonth.toDateString()}} }).then(function(monthlyDepreciation) {
          statistics.monthlyPurchases = monthlyPurchases || 0;
          statistics.monthlySales = monthlySales || 0;
          statistics.monthlyAppreciation = monthlyAppreciation || 0;
          statistics.monthlyDepreciation = monthlyDepreciation || 0;
          statistics.net = statistics.monthlyPurchases + statistics.monthlyAppreciation - statistics.monthlySales - statistics.monthlyDepreciation;
          callback(statistics);
        });
      });
    });
  });
}

function generateYearlyAssetStatistics(account, callback){
  var today = new Date();
  var yearStart = new Date(today.getFullYear(), 0, 0, 0, 0, 0, 0);
  var statistics = {};

  models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Purchase, date: {gt: yearStart} } }).then(function(yearlyPurchases) {
    models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Sale, date: {gt: yearStart} } }).then(function(yearlySales) {
      models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Appreciation, date: {gt: yearStart} } }).then(function(yearlyAppreciation) {
        models.Transaction.sum('amount', { where: { AccountId:  account.id, type: TRANSACTION.Depreciation, date: {gt: yearStart} } }).then(function(yearlyDepreciation) {
          statistics.yearlyPurchases = yearlyPurchases || 0;
          statistics.yearlySales = yearlySales || 0;
          statistics.yearlyAppreciation = yearlyAppreciation || 0;
          statistics.yearlyDepreciation = yearlyDepreciation || 0;
          statistics.yearlyNet = statistics.yearlyPurchases + statistics.yearlyAppreciation - statistics.yearlySales - statistics.yearlyDepreciation;
          callback(statistics);
        });
      });
    });
  });
}

function generateHistoricalAssetStatistics(account, historicalSatistics, date, callback) {
  var today = new Date();
  var nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 0, 0, 0, 0);
  var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

  if(historicalSatistics === null){
    historicalSatistics = {purchasesAndAppreciation: {data: []}, salesAndDepreciation: {data: []}, balance: {data: []}, labels: []};
    var lastMonth = new Date(date.getFullYear(), date.getMonth(), 0, 0, 0, 0, 0);
    generateAssetStatistics(account, lastMonth, function(statistics){
      debug(statistics)
      historicalSatistics.startingBalance = statistics.balance;
      generateHistoricalAssetStatistics(account, historicalSatistics, date, callback);
    });
  } else if(date < nextMonth){
    generateMonthlyAssetStatistics(account, date, function(statistics){
      nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0);
      debug(statistics);
      historicalSatistics.labels.push(monthNames[date.getMonth()]);
      historicalSatistics.purchasesAndAppreciation.data.push(statistics.monthlyPurchases + statistics.monthlyAppreciation);
      historicalSatistics.salesAndDepreciation.data.push(statistics.monthlySales + statistics.monthlyDepreciation);
      historicalSatistics.balance.data.push(statistics.net + historicalSatistics.startingBalance);
      historicalSatistics.startingBalance += statistics.net;
      generateHistoricalAssetStatistics(account, historicalSatistics, nextMonth, callback);
    });
    
  } else {
    callback(historicalSatistics);
  }
}

function mergeObjects(a, b) {
  for (var attrname in a) { b[attrname] = a[attrname]; }
  return b;
}