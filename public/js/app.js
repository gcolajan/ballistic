var APIURL = '/api/:resource/:action/:action2';

var app = angular.module('ballistic', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngAnimate',
]).factory('API', function($resource) {
  return $resource(APIURL, null,
    {
        'update': { method:'PUT' }
    });
}).service('Session', function () {
  this.create = function (userID, username) {
    this.userID = userID;
    this.username = username;
  };
  this.destroy = function () {
    this.userID = null;
    this.username = null;
  };
  return this;
}).run(function ($rootScope, $location, AUTH_EVENTS, Session, USER_ROLES, API) {
  API.get({resource: 'users', action: 'session'},
    function (response, err) {
      if(response.success){
        Session.create(response.user.id, response.user.username);
        $rootScope.user = response.user;
        $rootScope.$broadcast(AUTH_EVENTS.Authenticated);

        if(!$rootScope.user.meta.goal){
          $location.path('/welcome')
        }
      } else {
        Session.destroy();
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      }

      //Authentication stuff
      $rootScope.$on('$routeChangeStart', function (event, next) {
        var authorizedRoles = next.data.authorizedRoles;
        if (!Session.userID && authorizedRoles[0] != USER_ROLES.all) {
          event.preventDefault();
          $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
        }
      });
  });

  $rootScope.$on(AUTH_EVENTS.notAuthenticated, function (event, next) {
    if($location.path() != '/') {
      event.preventDefault();
      $rootScope.loginError = 'session expired, please log back in';
      $location.path('/')
    }
  });
})