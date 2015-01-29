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
  console.log(Session.userID);
  console.log(Session.username);
  $scope.user = {}
  $scope.user.id = Session.userID
  $scope.user.username = Session.username

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