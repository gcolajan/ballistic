angular.module('ballistic').controller('TransactionCtrl', ['$scope', '$location', '$filter', '$routeParams', 'API', 'Session', function ($scope, $location, $filter, $routeParams, API, Session) {
  refresh();
  
  function refresh() {
    $scope.transaction = null

    if($routeParams.id){
      API.get({resource: 'accounts', action: $routeParams.id, action2: 'listtransactions'},
        function(response, err) {
          if(response.success){
            $scope.account = response.account;
            $scope.transactions = response.transactions;
          }
      });
    }
  }

  $scope.showEditTransaction = function (transaction) {
    if($scope.tempTransaction && $scope.tempTransaction.id == transaction.id){
      $scope.tempTransaction = null
    } else {
      $scope.tempTransaction = transaction;
      $scope.tempTransaction.editDate = $filter('date')(transaction.date, 'yyyy/MM/dd');
      if (transaction.Category) {
        $scope.tempTransaction.editCategory = transaction.Category.name;
      }
      $scope.tempTransaction.editType = transaction.type;
      $scope.tempTransaction.editAmount = transaction.amount;
      $scope.tempTransaction.editDescription = transaction.description;
    }
  }

  $scope.editTransaction = function (transaction) {
    transaction.error = null;

    if(!transaction || !transaction.editAmount || !transaction.editDate || !transaction.editType){
      $transaction.error = 'fields left empty';
    } else {
      API.update({resource: 'transactions', action: transaction.id},
        {accountID: $scope.account.id, amount: transaction.editAmount, date: transaction.editDate, type: transaction.editType, category: transaction.editCategory, description: transaction.editDescription},
        function (response, err) {
          if(response.success) {
            refresh();
            $scope.tempTransaction = null
          } else {
            transaction.error = response.error;
          }
        }
      );
    }
  }

  $scope.deleteTransaction = function (transaction) {
    if (transaction) {
      if (!transaction.deleteWarning) {
        transaction.deleteWarning = true;
      } else {
        API.delete({resource: 'transactions', action: transaction.id},
          function (response, err) {
            if(response.success) {
              refresh();
            }
          }
        );
      } 
    }
  }
}]);