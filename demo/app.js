(function () {
	'use strict';

  var app = angular.module('test', [
    'date-selects'
  ]);

  app.controller('TestCtrl', function ($scope) {
    $scope.user = {
      birthday: null
    };
  });
}());