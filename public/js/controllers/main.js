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
