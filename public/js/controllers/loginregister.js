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