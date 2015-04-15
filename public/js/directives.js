angular.module('ballistic').directive('graph', function() {
  var data;

  function link(scope, element, attrs) {
    scope.$watch(attrs.graph, function(value) {
      if (value) {
        element.html('<canvas id="' + attrs.graph +'"></canvas><div id = "' + attrs.graph + '-legend" class = "legend"></div>');
        data = value;
        renderGraph(data, attrs.graph, attrs.type);
      }
    });

    function renderGraph(data, elementName, type){
      var ctx = $('#' + elementName).get(0).getContext("2d");
      ctx.canvas.width = 461;
      ctx.canvas.height = 240;
      Chart.defaults.global.showTooltips = false;
      var myNewChart = new Chart(ctx);

      //This allows us to pass a color object as a shorthand to 
      //set color values
      if(data.datasets && data.datasets[0].colorObject){
        for (var i = 0; i < data.datasets.length; i++) {
          data.datasets[i].fillColor = 'rgba(' + data.datasets[i].colorObject.r + ', ' + data.datasets[i].colorObject.g + ', ' + data.datasets[i].colorObject.b + ', 0.2)';
          data.datasets[i].strokeColor = 'rgba(' + data.datasets[i].colorObject.r + ', ' + data.datasets[i].colorObject.g + ', ' + data.datasets[i].colorObject.b + ', 1)';
          data.datasets[i].pointColor = 'rgba(' + data.datasets[i].colorObject.r + ', ' + data.datasets[i].colorObject.g + ', ' + data.datasets[i].colorObject.b + ', 1)';
          data.datasets[i].pointStrokeColor = '#fff'
        }
      }
      
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
}).directive('options', function($compile) {
  function link(scope, element, attrs) {
    scope.$watch(attrs.options, function(value) {
      $('#' + attrs.id + '-combobox').remove();

      if (value) {
        var html = '<select class="combobox" id = "' + attrs.id + '"><option value>' + attrs.placeholder + '</option>';
        var caret = '<span class="caret" />';

        for(var i = 0; i < value.length; i++) {
          html += '<option value="' + value[i].name + '">' + value[i].name + '</option>'
        }

        html += '</select>'

        $(element).html(html);

        //if there's no categories, then we don't want to display the dropdown caret
        if(value.length == 0){
          caret = '';
        }

        $('#' + attrs.id).combobox({template: function() { return '<div class="combobox-container" id = "' + attrs.id + '-combobox"> <input type="hidden" /> <div class="input-group"> <input type="text" autocomplete="off" ng-model="' + attrs.model + '" class="u-full-width"/> <span class="input-group-addon dropdown-toggle" data-dropdown="dropdown"> ' + caret + ' <span class="glyphicon glyphicon-remove" /> </span> </div> </div>';}});

        $compile($('#' + attrs.id + '-combobox').contents())(scope);
      }     
    });
  }

  return {
    link: link
  };
}).directive('datePicker', function() {
  return {
    link: function(scope, element, attrs) {
      $(element).datepicker({format: 'yyyy/mm/dd'});

      scope.$watch(attrs.ngModel, function (value) {
        $(element).datepicker('update', value);
      });
    }
  };
})