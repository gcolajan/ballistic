angular.module('ballistic').controller('MainCtrl', ['$scope', '$location', 'API', 'Session', 'ACCOUNT_TYPES', 'TRANSACTION_TYPES', function ($scope, $location, API, Session, ACCOUNT_TYPES, TRANSACTION_TYPES) {
  $scope.ACCOUNT_TYPES = ACCOUNT_TYPES;
  $scope.TRANSACTION_TYPES = TRANSACTION_TYPES;
  $scope.today = new Date();

  $scope.logout = function () {
    API.save({resource: 'users', action: 'logout'},
      {},
      function (response, err) {
        console.log(response)
        Session.destroy();
        $location.path('/');
      }
    );
  }

  $scope.changePath = function (path) {
    $location.path(path)
  }
}]);

angular.module('ballistic').controller('LoginRegisterCtrl', ['$rootScope', '$scope', '$location', 'API', 'Session', 'AUTH_EVENTS', function ($rootScope, $scope, $location, API, Session, AUTH_EVENTS) {

  $scope.$on(AUTH_EVENTS.Authenticated, function (event, next) {
    $location.path('/dashboard')
  });

  $scope.register = function (credentials) {
    $scope.registerError = null;

    if(credentials && credentials.username && credentials.password){
      API.save({resource: 'users', action: 'create'},
        {username: credentials.username, password: credentials.password},
        function (response, err) {
          if(response.success == true){
            Session.create(response.user.id, response.user.username);
            $rootScope.user = response.user;
            $rootScope.$broadcast(AUTH_EVENTS.Authenticated);
            $location.path('/welcome');
          } else {
            $scope.registerError = response.error;
          }
        }
      );
    } else {
      $scope.registerError = "fields left empty";
    }
  }

  $scope.login = function (credentials) {
    $scope.loginError = null;

    if(credentials && credentials.username && credentials.password){
      API.save({resource: 'users', action: 'authenticate'},
        {username: credentials.username, password: credentials.password},
        function (response, err) {
          if(response.success == true){
            Session.create(response.user.id, response.user.username);
            $rootScope.user = response.user;
            $rootScope.$broadcast(AUTH_EVENTS.Authenticated);
            $location.path('/dashboard');
          } else {
            $scope.loginError = response.error;
          }
        }
      );
    } else {
      $scope.loginError = "fields left empty";
    }
  }
}]);

angular.module('ballistic').controller('DashboardCtrl', ['$scope', '$location', 'API', 'Session', function ($scope, $location, API, Session) {
  API.get({resource: 'accounts', action: 'statistics'},
    function (response, err) {
      $scope.accounts = response.accounts;
      $scope.statistics = response.statistics;
      $scope.incomeSpendData = {
        labels: response.statistics.historicalIncomeSpend.labels,
        datasets: [
          {
            label: "Income",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalIncomeSpend.income.data
          },
          {
            label: "Spend",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalIncomeSpend.spend.data
          },
          {
            label: "Balance",
            fillColor: "rgba(43,222,31,0.2)",
            strokeColor: "rgba(43,222,31,1)",
            pointColor: "rgba(43,222,31,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalIncomeSpend.balance.data
          },
        ]
      }

      $scope.investmentData = {
        labels: response.statistics.historicalInvestments.labels,
        datasets: [
          {
            label: "Withdrawls",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalInvestments.withdrawals.data
          },
          {
            label: "Contributions",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalInvestments.contributions.data
          },
          {
            label: "Interest",
            fillColor: "rgba(123,122,212,0.2)",
            strokeColor: "rgba(123,122,212,1)",
            pointColor: "rgba(123,122,212,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalInvestments.interest.data
          },
          {
            label: "Balance",
            fillColor: "rgba(43,222,31,0.2)",
            strokeColor: "rgba(43,222,31,1)",
            pointColor: "rgba(43,222,31,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalInvestments.balance.data
          },
        ]
      }

      $scope.debtData = {
        labels: response.statistics.historicalLiabilities.labels,
        datasets: [
          {
            label: "New Debt",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalLiabilities.debt.data
          },
          {
            label: "Interest",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalLiabilities.interest.data
          },
          {
            label: "Payments",
            fillColor: "rgba(123,122,212,0.2)",
            strokeColor: "rgba(123,122,212,1)",
            pointColor: "rgba(123,122,212,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalLiabilities.payments.data
          },
          {
            label: "Balance",
            fillColor: "rgba(43,222,31,0.2)",
            strokeColor: "rgba(43,222,31,1)",
            pointColor: "rgba(43,222,31,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalLiabilities.balance.data
          },
        ]
      }

      $scope.assetData = {
        labels: response.statistics.historicalAssets.labels,
        datasets: [
          {
            label: "Purchases &amp; Appreciation",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalAssets.purchasesAndAppreciation.data
          },
          {
            label: "Sales &amp; Depreciation",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalAssets.salesAndDepreciation.data
          },
          {
            label: "Worth",
            fillColor: "rgba(43,222,31,0.2)",
            strokeColor: "rgba(43,222,31,1)",
            pointColor: "rgba(43,222,31,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalAssets.balance.data
          },
        ]
      }
    }
  );
}]);

angular.module('ballistic').controller('WelcomeCtrl', ['$scope', '$location', 'API', 'Session', function ($scope, $location, API, Session) {
  $scope.accounts = {
    general: {
      name: 'Checkings',
      balance: 0,
      type: $scope.ACCOUNT_TYPES.General
    },
    investment: {
      name: 'Investments',
      interest: 6.5,
      type: $scope.ACCOUNT_TYPES.Investment
    },
    asset: {
      name: 'Assets',
      type: $scope.ACCOUNT_TYPES.Asset
    },
    liability: {
      name: 'Debts',
      type: $scope.ACCOUNT_TYPES.Liability
    }
  }

  $scope.meta = {
    currency: '$'
  }

  $scope.firstTimeSetUp = function(meta, accounts) {
    $scope.error = null;

    if (!meta || !meta.goal || !meta.age || !meta.currency){
      $scope.error = 'you must answer all general questions';
    } else if (!accounts.general.name || !accounts.investment.name || !accounts.investment.interest || !accounts.asset.name || !accounts.liability.name) {
      $scope.error = 'account forms left blank';
    } else {
      API.update({resource: 'usermeta', action: 'update'},
        {goal: meta.goal, age: meta.age, currency: meta.currency},
        function (response, err) {
          $scope.user.meta = response.usermeta;
          saveAccount(accounts.general, function(){
            saveAccount(accounts.investment, function(){
              saveAccount(accounts.asset, function(){
                saveAccount(accounts.liability, function(){
                  $location.path('/dashboard');
                });
              });
            });
          });
        }
      );
    }
  }

  function saveAccount(account, callback) {
    API.save({resource: 'accounts', action: 'create'},
      {name: account.name, type: account.type, interest: account.interest},
      function (response, err) {
        if(account.type == $scope.ACCOUNT_TYPES.General){
          var now = new Date();
          API.save({resource: 'transactions', action: 'create'},
            {accountID: response.account.id, amount: account.balance, date: now, type: $scope.TRANSACTION_TYPES.Income, category: 'Initial Deposit', description: 'Initial Deposit.'},
            function (response, err) {
              callback();
            }
          );
        } else {
          callback();
        }
      }
    );
  }
}]);

angular.module('ballistic').controller('SettingsCtrl', ['$scope', '$location', 'API', 'Session', 'AUTH_EVENTS', function ($scope, $location, API, Session, AUTH_EVENTS) {
  $scope.$on(AUTH_EVENTS.Authenticated, function (event, next) {
    console.log($scope.user);
    $scope.meta = $scope.user.meta;
  });

  $scope.saveMeta = function (meta) {
    $scope.error = null;
    $scope.message = null;

    if (!meta || !meta.goal || !meta.age || !meta.currency) {
      $scope.error = 'fields left empty';
    } else {
      API.update({resource: 'usermeta', action: 'update'},
        {goal: meta.goal, age: meta.age, currency: meta.currency},
        function (response, err) {
          if (response.success) {
            $scope.message = 'Saved';
          } else {
            $scope.error = response.error;
          }
        }
      );
    }
  }
}]);

angular.module('ballistic').controller('AccountCtrl', ['$scope', '$location', '$routeParams', '$filter', 'API', 'Session', 'SOLID_COLORS', function ($scope, $location, $routeParams, $filter, API, Session, SOLID_COLORS) {
  refresh();
  
  function refresh() {
    $scope.today = new Date();

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
                  $scope.categoryTransactions[categories[i].name] = {type: $scope.TRANSACTION_TYPES.Appreciation, category: categories[i].name, value: categories[i].value};
                  break;
                case $scope.ACCOUNT_TYPES.Liability:
                  $scope.categoryTransactions[categories[i].name] = {type: $scope.TRANSACTION_TYPES.Payment, category: categories[i].name};
                  break;
                case $scope.ACCOUNT_TYPES.Investment:
                  $scope.categoryTransactions[categories[i].name] = {type: $scope.TRANSACTION_TYPES.Growth, category: categories[i].name};
                  break;
              }
  
              categories[i].color = SOLID_COLORS[i];
              categories[i].label = categories[i].name + ' - ' + $filter('number')(categories[i].percentage, 2) + ' %';
            }

            console.log($scope.categoryTransactions)
            $scope.distributionData = categories;

            switch($scope.account.type){
              case $scope.ACCOUNT_TYPES.General:
                $scope.transaction = {type: $scope.TRANSACTION_TYPES.Spend};
                $scope.historicalInvestmentData = {
                  labels: response.historicalStatistics.labels,
                  datasets: [
                    {
                      label: "Income",
                      fillColor: "rgba(151,187,205,0.2)",
                      strokeColor: "rgba(151,187,205,1)",
                      pointColor: "rgba(151,187,205,1)",
                      pointStrokeColor: "#fff",
                      data: response.historicalStatistics.income.data
                    },
                    {
                      label: "Spend",
                      fillColor: "rgba(220,220,220,0.2)",
                      strokeColor: "rgba(220,220,220,1)",
                      pointColor: "rgba(220,220,220,1)",
                      pointStrokeColor: "#fff",
                      data: response.historicalStatistics.spend.data
                    },
                    {
                      label: "Balance",
                      fillColor: "rgba(43,222,31,0.2)",
                      strokeColor: "rgba(43,222,31,1)",
                      pointColor: "rgba(43,222,31,1)",
                      pointStrokeColor: "#fff",
                      data: response.historicalStatistics.balance.data
                    },
                  ]
                }
              break;
              case $scope.ACCOUNT_TYPES.Asset:
                $scope.transaction = {type: $scope.TRANSACTION_TYPES.Purchase};
                $scope.historicalInvestmentData = {
                  labels: response.historicalStatistics.labels,
                  datasets: [
                    {
                      label: "Purchases &amp; Appreciation",
                      fillColor: "rgba(151,187,205,0.2)",
                      strokeColor: "rgba(151,187,205,1)",
                      pointColor: "rgba(151,187,205,1)",
                      pointStrokeColor: "#fff",
                      data: response.historicalStatistics.purchasesAndAppreciation.data
                    },
                    {
                      label: "Sales &amp; Depreciation",
                      fillColor: "rgba(220,220,220,0.2)",
                      strokeColor: "rgba(220,220,220,1)",
                      pointColor: "rgba(220,220,220,1)",
                      pointStrokeColor: "#fff",
                      data: response.historicalStatistics.salesAndDepreciation.data
                    },
                    {
                      label: "Worth",
                      fillColor: "rgba(43,222,31,0.2)",
                      strokeColor: "rgba(43,222,31,1)",
                      pointColor: "rgba(43,222,31,1)",
                      pointStrokeColor: "#fff",
                      data: response.historicalStatistics.balance.data
                    },
                  ]
                }
              break;
              case $scope.ACCOUNT_TYPES.Liability:
                $scope.transaction = {type: $scope.TRANSACTION_TYPES.Debt};
                $scope.historicalDebtData = {
                  labels: response.historicalStatistics.labels,
                  datasets: [
                    {
                      label: "New Debt",
                      fillColor: "rgba(151,187,205,0.2)",
                      strokeColor: "rgba(151,187,205,1)",
                      pointColor: "rgba(151,187,205,1)",
                      pointStrokeColor: "#fff",
                      data: response.historicalStatistics.debt.data
                    },
                    {
                      label: "Interest",
                      fillColor: "rgba(220,220,220,0.2)",
                      strokeColor: "rgba(220,220,220,1)",
                      pointColor: "rgba(220,220,220,1)",
                      pointStrokeColor: "#fff",
                      data: response.historicalStatistics.interest.data
                    },
                    {
                      label: "Payments",
                      fillColor: "rgba(123,122,212,0.2)",
                      strokeColor: "rgba(123,122,212,1)",
                      pointColor: "rgba(123,122,212,1)",
                      pointStrokeColor: "#fff",
                      data: response.historicalStatistics.payments.data
                    },
                    {
                      label: "Balance",
                      fillColor: "rgba(43,222,31,0.2)",
                      strokeColor: "rgba(43,222,31,1)",
                      pointColor: "rgba(43,222,31,1)",
                      pointStrokeColor: "#fff",
                      data: response.historicalStatistics.balance.data
                    },
                  ]
                }
              break;
              case $scope.ACCOUNT_TYPES.Investment:
                $scope.transaction = {type: $scope.TRANSACTION_TYPES.Investment};
                $scope.historicalInvestmentData = {
                  labels: response.historicalStatistics.labels,
                  datasets: [
                    {
                      label: "Withdrawls",
                      fillColor: "rgba(151,187,205,0.2)",
                      strokeColor: "rgba(151,187,205,1)",
                      pointColor: "rgba(151,187,205,1)",
                      pointStrokeColor: "#fff",
                      data: response.historicalStatistics.withdrawals.data
                    },
                    {
                      label: "Contributions",
                      fillColor: "rgba(220,220,220,0.2)",
                      strokeColor: "rgba(220,220,220,1)",
                      pointColor: "rgba(220,220,220,1)",
                      pointStrokeColor: "#fff",
                      data: response.historicalStatistics.contributions.data
                    },
                    {
                      label: "Interest",
                      fillColor: "rgba(123,122,212,0.2)",
                      strokeColor: "rgba(123,122,212,1)",
                      pointColor: "rgba(123,122,212,1)",
                      pointStrokeColor: "#fff",
                      data: response.historicalStatistics.interest.data
                    },
                    {
                      label: "Balance",
                      fillColor: "rgba(43,222,31,0.2)",
                      strokeColor: "rgba(43,222,31,1)",
                      pointColor: "rgba(43,222,31,1)",
                      pointStrokeColor: "#fff",
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

  $scope.createTransaction = function (transaction) {
    transaction.error = null;

    if(transaction.type == $scope.TRANSACTION_TYPES.Sale) {
      transaction.amount = transaction.value;
    }

    if(!transaction || !transaction.amount || !transaction.date || !transaction.type){
      transaction.error = 'fields left empty';
    } else {
      API.save({resource: 'transactions', action: 'create'},
        {accountID: $scope.account.id, amount: transaction.amount, date: transaction.date, type: transaction.type, category: transaction.category, description: transaction.description},
        function (response, err) {
          if(response.success) {
            refresh();
            transaction = {type: 1};
          } else {
            transaction.error = response.error;
          }
        }
      );
    }
  }
}]);

angular.module('ballistic').controller('TransactionsCtrl', ['$scope', '$location', '$filter', '$routeParams', 'API', 'Session', function ($scope, $location, $filter, $routeParams, API, Session) {
  refresh();
  
  function refresh() {
    $scope.transaction = null

    if($routeParams.id){
      API.get({resource: 'accounts', action: $routeParams.id, action2: 'listtransactions'},
        function(response, err) {
          if(response.success){
            $scope.account = response.account;
            $scope.transactions = response.transactions;
          }
      });
    }
  }

  $scope.showEditTransaction = function (transaction) {
    $scope.transaction = transaction;
    $scope.transaction.editDate = $filter('date')($scope.transaction.date, 'yyyy/MM/dd');
    $scope.transaction.editCategory = transaction.Category.name;
    $scope.transaction.editType = $scope.transaction.type;
    $scope.transaction.editAmount = transaction.amount;
    $scope.transaction.editDescription = transaction.description;
  }

  $scope.editTransaction = function (transaction) {
    $scope.transactionError = null;

    if(!transaction || !transaction.editAmount || !transaction.editDate || !transaction.editType){
      $scope.transactionError = 'fields left empty';
    } else {
      API.update({resource: 'transactions', action: transaction.id},
        {accountID: $scope.account.id, amount: transaction.editAmount, date: transaction.editDate, type: transaction.editType, category: transaction.editCategory, description: transaction.editDescription},
        function (response, err) {
          if(response.success) {
            refresh();
            $scope.transaction = null;
          } else {
            $scope.transactionError = response.error;
          }
        }
      );
    }
  }

  $scope.deleteTransaction = function (transaction) {
    console.log(transaction);
    if (transaction) {
      if (!transaction.deleteWarning) {
        transaction.deleteWarning = true;
      } else {
        API.delete({resource: 'transactions', action: transaction.id},
          function (response, err) {
            console.log(response);
            if(response.success) {
              refresh();
            }
          }
        );
      } 
    }
  }
}]);