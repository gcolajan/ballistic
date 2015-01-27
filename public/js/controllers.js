angular.module('ballistic').controller('LoginRegisterCtrl', ['$scope', 'API', function ($scope, API) {
  $scope.register = function (regCredentials) {
    console.log(regCredentials);
    API.save({resource: 'users', action: 'register'},
      {},
      function (response, err) {
        console.log(response)
      }
    );
  }
  
}]);