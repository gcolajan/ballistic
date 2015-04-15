angular.module('ballistic').controller('DashboardCtrl', ['$scope', '$location', 'API', 'Session', function ($scope, $location, API, Session) {
  API.get({resource: 'accounts', action: 'statistics'},
    function (response, err) {
      $scope.accounts = response.accounts;
      
      angular.forEach($scope.accounts, function(value, key) {
          if(value.type == $scope.ACCOUNT_TYPES.Investment){
            $scope.hasInvestmentAccounts = true;
          }
          else if(value.type == $scope.ACCOUNT_TYPES.Asset){
            $scope.hasAssetAccounts = true;
          }
          else if(value.type == $scope.ACCOUNT_TYPES.Liability){
            $scope.hasLiabilityAccounts = true;
          }
          else if(value.type == $scope.ACCOUNT_TYPES.General){
            $scope.hasGeneralAccounts = true;
          }
      });
      
      $scope.statistics = response.statistics;
      if($scope.user.meta.includeInflation) {
        $scope.statistics.inflationYear = Math.floor($scope.today.getFullYear() + $scope.statistics.estimatedYearsRemaining);
      }
      $scope.incomeSpendData = response.statistics.historicalIncomeSpend == undefined ? undefined : {
        labels: response.statistics.historicalIncomeSpend.labels,
        datasets: [
          {
            label: "Income",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalIncomeSpend.income.data
          },
          {
            label: "Spend",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalIncomeSpend.spend.data
          },
          {
            label: "Balance",
            fillColor: "rgba(43,222,31,0.2)",
            strokeColor: "rgba(43,222,31,1)",
            pointColor: "rgba(43,222,31,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalIncomeSpend.balance.data
          },
        ]
      }
    
      $scope.investmentData = response.statistics.historicalInvestments == undefined ? undefined : {
        labels: response.statistics.historicalInvestments.labels,
        datasets: [
          {
            label: "Withdrawals",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalInvestments.withdrawals.data
          },
          {
            label: "Contributions",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalInvestments.contributions.data
          },
          {
            label: "Value Change",
            fillColor: "rgba(123,122,212,0.2)",
            strokeColor: "rgba(123,122,212,1)",
            pointColor: "rgba(123,122,212,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalInvestments.interest.data
          },
          {
            label: "Balance",
            fillColor: "rgba(43,222,31,0.2)",
            strokeColor: "rgba(43,222,31,1)",
            pointColor: "rgba(43,222,31,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalInvestments.balance.data
          },
        ]
      }

      $scope.debtData = response.statistics.historicalLiabilities == undefined ? undefined : {
        labels: response.statistics.historicalLiabilities.labels,
        datasets: [
          {
            label: "New Debt",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalLiabilities.debt.data
          },
          {
            label: "Interest",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalLiabilities.interest.data
          },
          {
            label: "Payments",
            fillColor: "rgba(123,122,212,0.2)",
            strokeColor: "rgba(123,122,212,1)",
            pointColor: "rgba(123,122,212,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalLiabilities.payments.data
          },
          {
            label: "Balance",
            fillColor: "rgba(43,222,31,0.2)",
            strokeColor: "rgba(43,222,31,1)",
            pointColor: "rgba(43,222,31,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalLiabilities.balance.data
          },
        ]
      }

      $scope.assetData = response.statistics.historicalAssets == undefined ? undefined : {
        labels: response.statistics.historicalAssets.labels,
        datasets: [
          {
            label: "Purchases &amp; Appreciation",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalAssets.purchasesAndAppreciation.data
          },
          {
            label: "Sales &amp; Depreciation",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalAssets.salesAndDepreciation.data
          },
          {
            label: "Worth",
            fillColor: "rgba(43,222,31,0.2)",
            strokeColor: "rgba(43,222,31,1)",
            pointColor: "rgba(43,222,31,1)",
            pointStrokeColor: "#fff",
            data: response.statistics.historicalAssets.balance.data
          },
        ]
      }
    }
  );
}]);