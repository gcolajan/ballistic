angular.module('ballistic').controller('SettingsCtrl', ['$scope', '$location', 'API', 'Session', 'AUTH_EVENTS', function ($scope, $location, API, Session, AUTH_EVENTS) {
  $scope.password = {};

  $scope.$on(AUTH_EVENTS.Authenticated, function (event, next) {
    $scope.meta = $scope.user.meta;

    $scope.meta.inflation = $scope.meta.inflation || 2;
    $scope.meta.lifeSpan = $scope.meta.lifeSpan || 81;
  });

  $scope.saveMeta = function (meta) {
    $scope.error = null;
    $scope.message = null;

    if (!meta || !meta.goal || !meta.age || !meta.currency || (meta.includeInflation && !meta.inflation) || (meta.depletingPrincipal && !meta.lifeSpan)) {
      $scope.error = 'fields left empty';
    } else {
      API.update({resource: 'usermeta', action: 'update'},
        {
          goal: meta.goal, age: meta.age,
          currency: meta.currency,
          includeInflation: meta.includeInflation,
          inflation: meta.inflation,
          depletingPrincipal: meta.depletingPrincipal,
          lifeSpan: meta.lifeSpan
        },
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

  $scope.savePassword = function (password) {
    $scope.password.error = null;
    $scope.password.message = null;

    if (!password || !password.new || !password.current) {
      $scope.password.error = 'fields left empty';
    } else {
      API.update({resource: 'users', action: 'update'},
        {currentPassword: password.current, newPassword: password.new},
        function (response, err) {
          if (response.success) {
            password.new = null;
            password.current = null;
            $scope.password.message = 'Password changed';
          } else {
            $scope.password.error = response.error;
          }
        }
      );
    }
  }
}]);