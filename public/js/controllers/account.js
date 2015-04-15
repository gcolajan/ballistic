angular.module('ballistic').controller('AccountCtrl', ['$scope', '$location', '$routeParams', '$filter', 'API', 'Session', 'SOLID_COLORS', function ($scope, $location, $routeParams, $filter, API, Session, SOLID_COLORS) {
  refresh();
  
  function refresh() {
    $scope.today = new Date();
    var todayFormat = $filter('date')($scope.today, 'yyyy/MM/dd');

    if($routeParams.id){
      API.get({resource: 'accounts', action: $routeParams.id},
        function(response, err) {
          if(response.success){
            $scope.categoryTransactions = {};
            $scope.account = response.account;
            $scope.transactions = response.transactions;
            $scope.statistics = response.statistics;
            var categories = response.statistics.distributionStatistics.categories;

            for(var i = 0; i < categories.length; i++){
              switch($scope.account.type){
                case $scope.ACCOUNT_TYPES.Asset:
                  $scope.categoryTransactions[categories[i].name] = {type: $scope.TRANSACTION_TYPES.Appreciation, date: todayFormat, category: categories[i].name, value: categories[i].value};
                  break;
                case $scope.ACCOUNT_TYPES.Liability:
                  $scope.categoryTransactions[categories[i].name] = {type: $scope.TRANSACTION_TYPES.Payment, date: todayFormat, category: categories[i].name, value: categories[i].value};
                  break;
                case $scope.ACCOUNT_TYPES.Investment:
                  $scope.categoryTransactions[categories[i].name] = {type: $scope.TRANSACTION_TYPES.Growth, date: todayFormat, category: categories[i].name, value: categories[i].value, newValue: categories[i].value};
                  break;
              }
  
              categories[i].color = SOLID_COLORS[i];
              categories[i].label = categories[i].name + ' - ' + $filter('number')(categories[i].percentage, 2) + ' %';
            }

            $scope.distributionData = categories;

            switch($scope.account.type){
              case $scope.ACCOUNT_TYPES.General:
                $scope.transaction = {type: $scope.TRANSACTION_TYPES.Spend, date: todayFormat};
                $scope.historicalInvestmentData = {
                  labels: response.historicalStatistics.labels,
                  datasets: [
                    {
                      label: "Income",
                      colorObject: {r: 151, g: 187, b: 205},
                      data: response.historicalStatistics.income.data
                    }, {
                      label: "Spend",
                      colorObject: {r: 220, g: 220, b: 220},
                      data: response.historicalStatistics.spend.data
                    }, {
                      label: "Balance",
                      colorObject: {r: 43, g: 222, b: 31},
                      data: response.historicalStatistics.balance.data
                    },
                  ]
                }
              break;
              case $scope.ACCOUNT_TYPES.Asset:
                $scope.transaction = {type: $scope.TRANSACTION_TYPES.Purchase, date: todayFormat};
                $scope.historicalInvestmentData = {
                  labels: response.historicalStatistics.labels,
                  datasets: [
                    {
                      label: "Purchases &amp; Appreciation",
                      colorObject: {r: 151, g: 187, b: 205},
                      data: response.historicalStatistics.purchasesAndAppreciation.data
                    }, {
                      label: "Sales &amp; Depreciation",
                      colorObject: {r: 220, g: 220, b: 220},
                      data: response.historicalStatistics.salesAndDepreciation.data
                    }, {
                      label: "Worth",
                      colorObject: {r: 43, g: 222, b: 31},
                      data: response.historicalStatistics.balance.data
                    },
                  ]
                }
              break;
              case $scope.ACCOUNT_TYPES.Liability:
                $scope.transaction = {type: $scope.TRANSACTION_TYPES.Debt, date: todayFormat};
                $scope.historicalDebtData = {
                  labels: response.historicalStatistics.labels,
                  datasets: [
                    {
                      label: "New Debt",
                      colorObject: {r: 151, g: 187, b: 205},
                      data: response.historicalStatistics.debt.data
                    }, {
                      label: "Interest",
                      colorObject: {r: 220, g: 220, b: 220},
                      data: response.historicalStatistics.interest.data
                    }, {
                      label: "Payments",
                      colorObject: {r: 123, g: 122, b: 212},
                      data: response.historicalStatistics.payments.data
                    }, {
                      label: "Balance",
                      colorObject: {r: 43, g: 222, b: 31},
                      data: response.historicalStatistics.balance.data
                    },
                  ]
                }
              break;
              case $scope.ACCOUNT_TYPES.Investment:
                $scope.transaction = {type: $scope.TRANSACTION_TYPES.Investment, date: todayFormat};
                $scope.historicalInvestmentData = {
                  labels: response.historicalStatistics.labels,
                  datasets: [
                    {
                      label: "Withdrawals",
                      colorObject: {r: 151, g: 187, b: 205},
                      data: response.historicalStatistics.withdrawals.data
                    }, {
                      label: "Contributions",
                      colorObject: {r: 220, g: 220, b: 220},
                      data: response.historicalStatistics.contributions.data
                    }, {
                      label: "Value Change",
                      colorObject: {r: 123, g: 122, b: 212},
                      data: response.historicalStatistics.interest.data
                    }, {
                      label: "Balance",
                      colorObject: {r: 43, g: 222, b: 31},
                      data: response.historicalStatistics.balance.data
                    },
                  ]
                }
              break;
            }
          }
      });
    } else {
      $scope.account = {type: $scope.ACCOUNT_TYPES.General}
    }
  }


  $scope.createAccount = function (account) {
    $scope.accountError = null;

    if(!account || !account.name || !account.type || !(account.type != $scope.ACCOUNT_TYPES.Investment || account.interest)){
      $scope.accountError = 'fields left empty';
    } else {
      API.save({resource: 'accounts', action: 'create'},
        {name: account.name, type: account.type, interest: account.interest},
        function (response, err) {
          if(response.success){
            $location.path('/account/' + response.account.id);
          } else {
            $scope.accountError = response.error;
          }
        }
      );
    }
  }

  $scope.editAccount = function (account) {
    account.error = null;

    if(!account || !account.name || !(account.type != $scope.ACCOUNT_TYPES.Investment || account.interest)){
      account.error = 'fields left empty';
    } else {
      API.update({resource: 'accounts', action: account.id},
        {name: account.name, interest: account.interest},
        function (response, err) {
          if(response.success){
            refresh();
          } else {
            account.error = response.error;
          }
        }
      );
    }
  }

  $scope.deleteAccount = function (account) {
    if (account) {
      if (!account.deleteWarning) {
        account.deleteWarning = true;
      } else {
        API.delete({resource: 'accounts', action: account.id},
          function (response, err) {
            if(response.success) {
              $location.path('/dashboard');
            }
          }
        );
      } 
    }
  }

  $scope.createTransaction = function (transaction) {
    transaction.error = null;

    if(transaction.type == $scope.TRANSACTION_TYPES.Sale) {
      transaction.amount = transaction.value;
    }

    if(transaction.type == $scope.TRANSACTION_TYPES.Growth) {
      transaction.amount = transaction.newValue - transaction.value;
    }

    if (transaction.type == $scope.TRANSACTION_TYPES.Growth && transaction.amount === 0) {
      transaction.error = 'new value must be different from current value';
    } else if(!transaction || !transaction.amount || !transaction.date || !transaction.type){
      transaction.error = 'fields left empty';
    } else {
      API.save({resource: 'transactions', action: 'create'},
        {accountID: $scope.account.id, amount: transaction.amount, date: transaction.date, type: transaction.type, category: transaction.category, description: transaction.description},
        function (response, err) {
          if(response.success) {
            var category = null;
            var todayFormat = $filter('date')($scope.today, 'yyyy/MM/dd');
            refresh();

            //if this is a category transaction
            if(transaction.value){
              switch($scope.account.type){
                case $scope.ACCOUNT_TYPES.Asset:
                  transaction = {type: $scope.TRANSACTION_TYPES.Appreciation, date: todayFormat, category: transaction.category, value: transaction.value};
                  break;
                case $scope.ACCOUNT_TYPES.Liability:
                  transaction = {type: $scope.TRANSACTION_TYPES.Payment, date: todayFormat, category: transaction.category};
                  break;
                case $scope.ACCOUNT_TYPES.Investment:
                  transaction = {type: $scope.TRANSACTION_TYPES.Growth, date: todayFormat, category: transaction.category, value: transaction.amount, newValue: transaction.amount};
                  break;
              }
            } else {
              switch($scope.account.type){
                case $scope.ACCOUNT_TYPES.General:
                  $scope.transaction = {type: $scope.TRANSACTION_TYPES.Spend, date: todayFormat};
                break;
                case $scope.ACCOUNT_TYPES.Asset:
                  $scope.transaction = {type: $scope.TRANSACTION_TYPES.Purchase, date: todayFormat};
                break;
                case $scope.ACCOUNT_TYPES.Liability:
                  $scope.transaction = {type: $scope.TRANSACTION_TYPES.Debt, date: todayFormat};
                  
                break;
                case $scope.ACCOUNT_TYPES.Investment:
                  $scope.transaction = {type: $scope.TRANSACTION_TYPES.Investment, date: todayFormat};
                break;
              }
            }            
          } else {
            transaction.error = response.error;
          }
        }
      );
    }
  }
}]);