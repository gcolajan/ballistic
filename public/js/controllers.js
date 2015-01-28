angular.module('ballistic').controller('LoginRegisterCtrl', ['$scope', 'API', function ($scope, API) {
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
          console.log(response)
        }
      );
    }
  }
  
}]);