var APIURL = '/api/:resource/:action';

var app = angular.module('ballistic', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngAnimate',
]).factory('API', function($resource) {
  return $resource(APIURL);
}).constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated',
  expired: 'auth-expired'
}).constant('USER_ROLES', {
  all: '*',
  user: 'user'
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
      console.log(response)
      if(response.success){
        Session.create(response.user.id, response.user.username);
      } else {
        Session.destroy();
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      }

      //Authentication stuff
      $rootScope.$on('$routeChangeStart', function (event, next) {
        var authorizedRoles = next.data.authorizedRoles;
        console.log(Session.userID)
        if (!Session.userID && authorizedRoles[0] != USER_ROLES.all) {
          event.preventDefault();
          $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
        }
      });
  });

  

  $rootScope.$on(AUTH_EVENTS.notAuthenticated, function (event, next) {
    event.preventDefault();
    $location.path('/')
  });
})