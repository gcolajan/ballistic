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