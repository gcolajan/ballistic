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

angular.module('ballistic').controller('LoginRegisterCtrl', ['$rootScope', '$scope', '$location', 'API', 'Session', 'AUTH_EVENTS', function ($rootScope, $scope, $location, API, Session, AUTH_EVENTS) {

  $scope.$on(AUTH_EVENTS.Authenticated, function (event, next) {
    $location.path('/dashboard')
  });

  $scope.register = function (credentials) {
    if(credentials && credentials.username && credentials.password){
      API.save({resource: 'users', action: 'create'},
        {username: credentials.username, password: credentials.password},
        function (response, err) {
          if(response.success == true){
            console.log("true: creating session");
            Session.create(response.user.id, response.user.username);
            $rootScope.user = response.user;
            $rootScope.$broadcast(AUTH_EVENTS.Authenticated);
            console.log("true: redirecting");
            $location.path('/dashboard')
          }
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
            console.log(response.user)
            $rootScope.user = response.user;
            $rootScope.$broadcast(AUTH_EVENTS.Authenticated);
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
  API.get({resource: 'accounts', action: 'statistics'},
    function (response, err) {
      $scope.accounts = response.accounts;
      $scope.statistics = response.statistics;
      console.log(response);
    }
  );
}]);

angular.module('ballistic').controller('SettingsCtrl', ['$scope', '$location', 'API', 'Session', 'AUTH_EVENTS', function ($scope, $location, API, Session, AUTH_EVENTS) {
  $scope.$on(AUTH_EVENTS.Authenticated, function (event, next) {
    console.log($scope.user);
    $scope.meta = $scope.user.meta;
  });

  $scope.saveMeta = function (meta) {
    console.log(meta);
    if(meta && meta.goal && meta.age && meta.currency != 4){
      API.update({resource: 'usermeta', action: 'update'},
        {goal: meta.goal, age: meta.age, currency: meta.currency},
        function (response, err) {
          console.log(response)
        }
      );
    }
  }
}]);

angular.module('ballistic').controller('AccountCtrl', ['$scope', '$location', '$routeParams', 'API', 'Session', function ($scope, $location, $routeParams, API, Session) {
  refresh();
  
  function refresh() {
    $scope.today = new Date();
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
  }


  $scope.createAccount = function (account) {
    console.log(account);
    if(account && account.name && account.type && (account.type != 4 || account.interest)){
      API.save({resource: 'accounts', action: 'create'},
        {name: account.name, type: account.type, interest: account.interest},
        function (response, err) {
          if(response.success){
            $location.path('/account/' + response.account.id)
          }
        }
      );
    }
  }

  $scope.createTransaction = function (transaction) {
    console.log(transaction);
    if(transaction && transaction.amount && transaction.date && transaction.type){
      API.save({resource: 'transactions', action: 'create'},
        {accountID: $scope.account.id, amount: transaction.amount, date: transaction.date, type: transaction.type},
        function (response, err) {
          if(response.success) {
            refresh();
            $scope.transaction = {type: 1};
          }
        }
      );
    }
  }

  $scope.deleteTransaction = function (transaction) {
    console.log(transaction);
    if(transaction){
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
}]);