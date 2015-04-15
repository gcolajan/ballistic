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
            colorObject: {r: 151, g: 187, b: 205},
            data: response.statistics.historicalIncomeSpend.income.data
          }, {
            label: "Spend",
            colorObject: {r: 220, g: 220, b: 220},
            data: response.statistics.historicalIncomeSpend.spend.data
          }, {
            label: "Balance",
            colorObject: {r: 43, g: 222, b: 31},
            data: response.statistics.historicalIncomeSpend.balance.data
          },
        ]
      }
    
      $scope.investmentData = response.statistics.historicalInvestments == undefined ? undefined : {
        labels: response.statistics.historicalInvestments.labels,
        datasets: [
          {
            label: "Withdrawals",
            colorObject: {r: 151, g: 187, b: 205},
            data: response.statistics.historicalInvestments.withdrawals.data
          }, {
            label: "Contributions",
            colorObject: {r: 220, g: 220, b: 220},
            data: response.statistics.historicalInvestments.contributions.data
          }, {
            label: "Value Change",
            colorObject: {r: 123, g: 122, b: 212},
            data: response.statistics.historicalInvestments.interest.data
          }, {
            label: "Balance",
            colorObject: {r: 43, g: 222, b: 31},
            data: response.statistics.historicalInvestments.balance.data
          },
        ]
      }

      $scope.debtData = response.statistics.historicalLiabilities == undefined ? undefined : {
        labels: response.statistics.historicalLiabilities.labels,
        datasets: [
          {
            label: "New Debt",
            colorObject: {r: 151, g: 187, b: 205},
            data: response.statistics.historicalLiabilities.debt.data
          }, {
            label: "Interest",
            colorObject: {r: 220, g: 220, b: 220},
            data: response.statistics.historicalLiabilities.interest.data
          }, {
            label: "Payments",
            colorObject: {r: 123, g: 122, b: 212},
            data: response.statistics.historicalLiabilities.payments.data
          }, {
            label: "Balance",
            colorObject: {r: 43, g: 222, b: 31},
            data: response.statistics.historicalLiabilities.balance.data
          },
        ]
      }

      $scope.assetData = response.statistics.historicalAssets == undefined ? undefined : {
        labels: response.statistics.historicalAssets.labels,
        datasets: [
          {
            label: "Purchases &amp; Appreciation",
            colorObject: {r: 151, g: 187, b: 205},
            data: response.statistics.historicalAssets.purchasesAndAppreciation.data
          }, {
            label: "Sales &amp; Depreciation",
            colorObject: {r: 220, g: 220, b: 220},
            data: response.statistics.historicalAssets.salesAndDepreciation.data
          }, {
            label: "Worth",
            colorObject: {r: 43, g: 222, b: 31},
            data: response.statistics.historicalAssets.balance.data
          },
        ]
      }
    }
  );
}]);