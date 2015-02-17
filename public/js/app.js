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
  4: 'Investment',
  'General': 1,
  'Asset': 2,
  'Liability': 3,
  'Investment': 4
}).constant('TRANSACTION_TYPES', {
  1: 'Investment',
  2: 'Growth',
  3: 'Withdrawal',
  4: 'Spend',
  5: 'Income',
  6: 'Purchase',
  7: 'Appreciation',
  8: 'Depreciation',
  9: 'Sale',
  10: 'Debt',
  11: 'Payment',
  12: 'Interest',
  'Investment': 1,
  'Growth': 2,
  'Withdrawal': 3,
  'Spend': 4,
  'Income': 5,
  'Purchase': 6,
  'Appreciation': 7,
  'Depreciation': 8,
  'Sale': 9,
  'Debt': 10,
  'Payment': 11,
  'Interest': 12
}).constant('SOLID_COLORS', {
  0: '#1abc9c',
  1: '#3498db',
  2: '#9b59b6',
  3: '#34495e',
  4: '#2ecc71',
  5: '#f1c40f',
  6: '#e74c3c',
  7: '#72CBDB',
  8: '#55134E',
  9: '#A0596B',
  10: '#FEC343',
  11: '#EF7351',
  12: '#231F20',
  13: '#006295',
  14: '#9BE1FB',
  15: '#593E1A'
}).directive('graph', function() {
  var data;

  function link(scope, element, attrs) {
    scope.$watch(attrs.graph, function(value) {
      element.html('<canvas id="' + attrs.graph +'"></canvas><div id = "' + attrs.graph + '-legend" class = "legend"></div>');
      data = value;
      renderGraph(data, attrs.graph, attrs.type);
    });

    function renderGraph(data, elementName, type){
      var ctx = $('#' + elementName).get(0).getContext("2d");
      ctx.canvas.width = 461;
      ctx.canvas.height = 240;
      Chart.defaults.global.showTooltips = false;
      var myNewChart = new Chart(ctx);
      
      switch(type){
        case 'line':
          var chart = new Chart(ctx).Line(data);
          break;
        case 'pie':
          var chart = new Chart(ctx).Pie(data);
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
}).directive('datePicker', function() {
  return {
    link: function(scope, element, attrs) {
      $(element).datepicker({format: 'yyyy/mm/dd'});
    }
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