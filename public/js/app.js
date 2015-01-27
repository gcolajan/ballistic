var APIURL = '/api/:resource/:action';

var app = angular.module('ballistic', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngAnimate',
]).constant('USER_ROLES', {
  all: '*',
  admin: 'admin',
  creator: 'creator',
  user: 'user'
}).factory('API', function($resource) {
  return $resource(APIURL);
}).service('Session', function() {
  this.create = function(sessionID, userID, userRole) {
    this.id = sessionID;
    this.userID = userID;
    return this.userRole = userRole;
  };
  this.destroy = function() {
    this.id = null;
    this.userID = null;
    return this.userRole = null;
  };
  return this;
}).factory('authService', function($cookies, Session, API) {
  var authService;
  authService = {};
  authService.createSession = function(sessionID, userID, userRole, rememberMe) {
    $cookies.loggedIn = true;
    return Session.create(sessionID, userID, userRole);
  };
  authService.destroySession = function() {
    $cookies.loggedIn = false;
    return Session.destroy();
  };
  authService.loadSession = function(callback) {
    return API.get({
      resource: 'auth',
      action: 'session'
    }, function(response, err) {
      if (response.success) {
        $cookies.loggedIn = true;
        Session.create(response.data.session.id, response.data.user.id, response.data.user.role);
        return callback(response.data.user);
      } else {
        return callback(false);
      }
    });
  };
  authService.isAuthenticated = function() {
    console.log(Session.userID);
    console.log('checking authentication');
    return !!Session.userID;
  };
  authService.isAuthorized = function(authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
      console.log(Session);
    }
    return authService.isAuthenticated() && authorizedRoles.indexOf(Session.userRole) !== -1;
  };
  return authService;
})