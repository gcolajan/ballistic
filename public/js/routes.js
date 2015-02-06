angular.module('ballistic').config(function($routeProvider, $locationProvider, USER_ROLES) {
  $routeProvider.when('/', {
    templateUrl: 'views/login.html',
    controller: 'LoginRegisterCtrl',
    data: {
      authorizedRoles: [USER_ROLES.all]
    }
  }).when('/dashboard', {
    templateUrl: 'views/dashboard.html',
    controller: 'DashboardCtrl',
    data: {
      authorizedRoles: [USER_ROLES.user]
    }
  }).when('/settings', {
    templateUrl: 'views/settings.html',
    controller: 'SettingsCtrl',
    data: {
      authorizedRoles: [USER_ROLES.user]
    }
  }).when('/account/add', {
    templateUrl: 'views/addaccount.html',
    controller: 'AccountCtrl',
    data: {
      authorizedRoles: [USER_ROLES.user]
    }
  }).when('/account/:id', {
    templateUrl: 'views/account.html',
    controller: 'AccountCtrl',
    data: {
      authorizedRoles: [USER_ROLES.user]
    }
  }).when('/account/:id/transactions', {
    templateUrl: 'views/transactions.html',
    controller: 'TransactionsCtrl',
    data: {
      authorizedRoles: [USER_ROLES.user]
    }
  }).when('/account/:id/transactions/:transactionID', {
    templateUrl: 'views/transactions.html',
    controller: 'TransactionsCtrl',
    data: {
      authorizedRoles: [USER_ROLES.user]
    }
  }).when('/404', {
    templateUrl: 'views/login.html',
    data: {
      authorizedRoles: [USER_ROLES.all]
    }
  }).otherwise({
    redirectTo: '/404'
  });

  if(window.history && window.history.pushState){
    $locationProvider.html5Mode(true);
  }
});