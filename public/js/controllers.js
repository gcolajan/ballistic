angular.module('ballistic').controller('LoginRegisterCtrl', ['$scope', 'API', function ($scope, API) {
  $scope.register = function (regCredentials) {
    if(regCredentials && regCredentials.username && regCredentials.password){
      API.save({resource: 'users', action: 'create'},
        {username: regCredentials.username, password: regCredentials.password},
        function (response, err) {
          console.log(response)
        }
      );
    }
  }
  
}]);