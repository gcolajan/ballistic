var APIURL = '/api/:resource/:action';

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
}).constant('AUTH_EVENTS', {
  notAuthenticated: 'auth-not-authenticated',
  authenticated: 'auth-authenticated',
  expired: 'auth-expired'
}).constant('USER_ROLES', {
  all: '*',
  user: 'user'
}).constant('ACCOUNT_TYPES', {
  1: 'General',
  2: 'Asset',
  3: 'Liability',
  4: 'Investment'
}).constant('TRANSACTION_TYPES', {
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
        $rootScope.user = response.user;
        $rootScope.$broadcast(AUTH_EVENTS.Authenticated);
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