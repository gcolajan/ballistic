angular.module('ballistic').controller('MainCtrl', ['$scope', '$location', 'API', 'Session', function ($scope, $location, API, Session) {
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
}]);

angular.module('ballistic').controller('LoginRegisterCtrl', ['$scope', '$location', 'API', 'Session', function ($scope, $location, API, Session) {

  if(Session.userID){
    $location.path('/dashboard')
  }

  $scope.register = function (credentials) {
    if(credentials && credentials.username && credentials.password){
      API.save({resource: 'users', action: 'create'},
        {username: credentials.username, password: credentials.password},
        function (response, err) {
          console.log(response)
        }
      );
    }
  }

  $scope.login = function (credentials) {
    if(credentials && credentials.username && credentials.password){
      API.save({resource: 'users', action: 'authenticate'},
        {username: credentials.username, password: credentials.password},
        function (response, err) {
          if(response.success == true){
            console.log("true: creating session");
            Session.create(response.user.id, response.user.username);
            console.log("true: redirecting");
            $location.path('/dashboard')
          }
          console.log(response)
        }
      );
    }
  }
}]);

angular.module('ballistic').controller('DashboardCtrl', ['$scope', '$location', 'API', 'Session', function ($scope, $location, API, Session) {
  API.get({resource: 'accounts', action: 'list'},
    function (response, err) {
      $scope.accounts = response.accounts;
      console.log(response);
    }
  );
}]);

angular.module('ballistic').controller('AccountCtrl', ['$scope', '$location', '$routeParams', 'API', 'Session', function ($scope, $location, $routeParams, API, Session) {
  $scope.transaction = {type: 1}
  if($routeParams.id){
    console.log("getting account info")
    API.get({resource: 'accounts', action: $routeParams.id},
      function(response, err) {
        if(response.success){
          $scope.account = response.account;
          $scope.transactions = response.transactions;
          $scope.statistics = response.statistics;
        }
        console.log(response);
    });
  } else {
    console.log("no id")
    $scope.account = {type: 1}
  }


  $scope.createAccount = function (account) {
    console.log(account);
    if(account && account.name && account.type && (account.type != 4 || account.interest)){
      API.save({resource: 'accounts', action: 'create'},
        {name: account.name, type: account.type, interest: account.interest},
        function (response, err) {
          console.log(response.data)
        }
      );
    }
  }

  $scope.createTransaction = function (transaction) {
    console.log(transaction);
    if(transaction && transaction.amount && transaction.date && transaction.type){
      API.save({resource: 'transaction', action: 'create'},
        {accountID: $scope.account.id, amount: transaction.amount, date: transaction.date, type: transaction.type},
        function (response, err) {
          console.log(response)
        }
      );
    }
  }
}]);