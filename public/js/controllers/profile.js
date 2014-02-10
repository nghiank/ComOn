'use strict';

angular.module('ace.system')
.controller('ProfileController', ['$scope', 'Global', '$routeParams',function ($scope, Global, $routeParams) {
    $scope.global = Global;
    $scope.urlUserName = $routeParams.username;
    $scope.username = Global.user.name;
    $scope.codename = (Global.user.codeName === null) ? Global.user.name : (Global.user.isManufacturer ? Global.user.codeName : Global.user.codeName + ' (pending)');
    $scope.codeNameInput = {value:''};
    $scope.email = Global.user.email;
    $scope.editable = false;
    $scope.codeNameMinLength= 1;
    $scope.codeNameMaxLength= 30;
    $scope.codeInfo = 'Code name is optional information only applicable for manufacturers.Code name appears in the field "manufacturer" in your catalog. By changing your default CODE name, you automatically apply to register as an manufacturer. You new CODE name is only confirmed after the verfication from the administrator.';
    $scope.codeInfoTitle = 'What is CODE name?';
    $scope.toggleEdit = function(){
        $scope.editable= !$scope.editable;
    };
    $scope.checkUnique = function(){
        $scope.email = 'Blur is working';
    };
}])
;