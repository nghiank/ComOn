'use strict';

angular.module('ace.system')
.controller('ProfileController', ['$scope', 'Global', '$routeParams', '$resource', function ($scope, Global, $routeParams, $resource) {

    $scope.init = function(){
        if (!Global.authenticated)
            window.location.replace('/');
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
                                    {change:{method:'PUT'}});
            update.change(function(){
                Global.user.codeName = $scope.codeNameInput.value;
                $scope.codename = (Global.user.codeName === null) ? Global.user.name : (Global.user.isManufacturer ? Global.user.codeName : Global.user.codeName + ' (pending)');
            });
        };
        $scope.checkValid = function(){
            $scope.lengthCheck = $scope.codeNameInput.value.length >= $scope.codeNameInput.minLength && $scope.codeNameInput.value.length <= $scope.codeNameInput.maxLength ;
            $scope.patternCheck = $scope.codeNameInput.pattern.test($scope.codeNameInput.value);
            $scope.codeNameInput.valid = ($scope.lengthCheck && $scope.patternCheck);
        };
    };
    $scope.init();
    
    

}])
;