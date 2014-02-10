'use strict';

angular.module('ace.system')
.controller('ProfileController', ['$scope', 'Global', '$routeParams',function ($scope, Global, $routeParams) {
    $scope.global = Global;
    $scope.urlUserName = $routeParams.username;
    $scope.username = Global.user.name;
    $scope.codename = $scope.username;
    $scope.codeNameInput = {value:''};
    $scope.email = Global.user.email;
    $scope.editable = false;
    $scope.codeNameMinLength= 1;
    $scope.codeNameMaxLength= 30;
    $scope.codeInfo = 'Code name is optional information only applicable for manufacturers.Code name appears in the field "manufacturer" in your catalog';
    $scope.codeInfoTitle = 'What is CODE name?';
    $scope.toggleEdit = function(){
        $scope.editable= !$scope.editable;
    };
}])
;