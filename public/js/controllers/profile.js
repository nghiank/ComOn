'use strict';

angular.module('ace.system')
.controller('ProfileController', ['$scope', 'Global', '$routeParams', '$resource', '$location', function ($scope, Global, $routeParams, $resource, $location) {
    $scope.global = Global;
    $scope.urlUserName = $routeParams.username;
    $scope.username = Global.user.name;
    $scope.codename = (Global.user.codeName === null) ? Global.user.name : (Global.user.isManufacturer ? Global.user.codeName : Global.user.codeName + ' (pending)');
    $scope.codeNameInput = {value:'', valid:false,minLength:1, maxLength:30, pattern:/^\s*\w*\s*$/ };
    $scope.email = Global.user.email;
    $scope.editable = false;
    
    
    $scope.toggleEdit = function(){
        $scope.editable= !$scope.editable;
    };
    $scope.updateCodeName = function(){
        $scope.editable= !$scope.editable;
        var update = $resource('/updateCodeName/:name/:codeName',
                                {name:Global.user.name, codeName: $scope.codeNameInput.value},
                                {change:{method:'GET'}});
        update.change(function(){
            Global.user.codeName = $scope.codeNameInput.value;
            $scope.codename = (Global.user.codeName === null) ? Global.user.name : (Global.user.isManufacturer ? Global.user.codeName : Global.user.codeName + ' (pending)');
        });
    };
    $scope.checkValid = function(){
        if ($scope.codeNameInput.value.length >= $scope.codeNameInput.minLength && $scope.codeNameInput.value.length <= $scope.codeNameInput.maxLength && $scope.codeNameInput.pattern.test($scope.codeNameInput.value))
        $scope.codeNameInput.valid = true;
    }
}])
;