(function () {
  'use strict';

  var module = angular.module('date-selects', []);

  function generateIntRange (high, low) {
    var range = [];
    low = low || 0;
    while (low <= high) {
      range.push(low++);
    }
    return range;
  }

  function convertStringToDate (dateString) {
    var stringDateTypes = {
          timestamp: {
            regex: /[0-9]+/,
            capture: null
          },
          yyyymmdd: {
            regex: /^([0-9]{4})[-\._:]?([0-9]{2})[-\._:]?([0-9]{2})$/,
            capture: {
              'year': 1,
              'month': 2,
              'day': 3
            }
          }
        },
        types = Object.keys(stringDateTypes),
        typeLength = types.length,
        currentType,
        matches;

    while (typeLength--) {
      currentType = stringDateTypes[types[typeLength]];
      matches = dateString.match(currentType.regex);

      if (!matches) continue;

      if (!currentType.capture) return new Date(parseInt(matches[0]));

      return new Date(
        matches[currentType.capture.year],
        matches[currentType.capture.month] - 1,
        matches[currentType.capture.day]);
    }
    return false;
  }

  function processDate (potentialDate) {
    var converted = null;

    if (!potentialDate) return;

    if (potentialDate instanceof Date) return potentialDate;

    potentialDate = String(potentialDate);
    converted = convertStringToDate(potentialDate);

    if (!converted) throw new Error('[Date Selector]: Date value is not recognized!');

    return converted;
  }

  function daysInMonth (month, year) {
    return new Date(year, month, 0).getDate();
  }

  module.directive('dateSelector', function () {
    return {
      restrict: 'EAC',
      template:
      '<ul>' +
      '{{ selected }}' +
      '<li>' +
      '<select ng-model="selected.day" ng-options="d for d in days"></select>' +
      '</li>' +
      '<li>' +
      '<select ng-model="selected.month" ng-options="month for month in months"></select>' +
      '</li>' +
      '<li>' +
      '<select ng-model="selected.year" ng-options="year for year in years"></select>' +
      '</li>' +
      '</ul>',
      replace: true,
      require: 'ngModel',
      scope: {
        name: '=?',
        startYear: '=?',
        endYear: '=?'
      },
      link: function postLink(scope, element, attrs, ngModelCtrl) {
        scope.name = scope.name || 'date-selector';
        scope.startYear = scope.startYear || new Date().getFullYear();
        scope.endYear = scope.endYear || scope.startYear + 20;

        scope.selected = {
          day: 1,
          month: 1,
          year: scope.startYear
        };

        scope.years = generateIntRange(scope.endYear, scope.startYear);
        scope.months = generateIntRange(12, 1);
        scope.days = [];

        ngModelCtrl.$formatters.push(function (modelValue) {
          var dateObj = processDate(modelValue);

          dateObj = dateObj || new Date(
            scope.selected.year,
            scope.selected.month - 1,
            scope.selected.day
          );

          return {
            day: dateObj.getDate(),
            month: dateObj.getMonth() + 1,
            year: dateObj.getFullYear()
          };
        });

        ngModelCtrl.$render = function () {
          scope.selected.day = ngModelCtrl.$viewValue.day;
          scope.selected.month = ngModelCtrl.$viewValue.month;
          scope.selected.year = ngModelCtrl.$viewValue.year;
        };

        ngModelCtrl.$parsers.push(function (viewValue) {
          return new Date(
            viewValue.year,
            viewValue.month - 1,
            viewValue.day
          );
        });

        scope.$watch('selected.month + selected.year', function (newValue, oldValue) {
          scope.days = generateIntRange(daysInMonth(scope.selected.month, scope.selected.year), 1);
          if (scope.days.indexOf(scope.selected.day) < 0) {
            scope.selected.day = 1;
          }
        });
      }
    };
  });
}());