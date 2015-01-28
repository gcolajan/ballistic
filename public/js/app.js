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
  notAuthenticated: 'auth-not-authenticated'
}).constant('USER_ROLES', {
  all: '*',
  admin: 'user'
}).run(function ($rootScope) {
  //Authentication stuff
  // $rootScope.$on('$routeChangeStart', function (event, next) {
  //   var authorizedRoles = next.data.authorizedRoles;
  //   if (!AuthService.isAuthorized(authorizedRoles)) {
  //     event.preventDefault();
  //     if (AuthService.isAuthenticated()) {
  //       // user is not allowed
  //       $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
  //     } else {
  //       // user is not logged in
  //       $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
  //     }
  //   }
  // });

  // $rootScope.$on AUTH_EVENTS.notAuthenticated, showLogin
})