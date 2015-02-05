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
}).directive('graph', function() {
  var data;

  function link(scope, element, attrs) {
    scope.$watch(attrs.graph, function(value) {
      element.html('<canvas id="' + attrs.graph +'"></canvas><div id = "' + attrs.graph + '-legend" class = "legend"></div>');
      data = value;
      renderGraph(data, attrs.graph, attrs.type);
    });

    function renderGraph(data, elementName, type){
      // Get context with jQuery - using jQuery's .get() method.
      var ctx = $('#' + elementName).get(0).getContext("2d");
      ctx.canvas.width = 461;
      ctx.canvas.height = 240;
      // This will get the first returned node in the jQuery collection.
      Chart.defaults.global.showTooltips = false;
      var myNewChart = new Chart(ctx);
      switch(type){
        case 'line':
          var chart = new Chart(ctx).Line(data);
          break;
        default:
          var chart = new Chart(ctx).Line(data);
          break;
      }
        
      $('#' + elementName + '-legend').html(chart.generateLegend());
    }
  }

  return {
    link: link
  };
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