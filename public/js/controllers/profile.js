'use strict';

angular.module('ace.users')
.controller('ProfileController', ['$scope', '$rootScope', 'Global', 'UsersAPI',  function ($scope, $rootScope, Global, UsersAPI) {

        $scope.global = Global;
        $scope.username = Global.user.name;
        $scope.codeNameInput =
            {value:'',
            valid:{valid:true,lengthCheck: true, patternCheck:true},
            minLength:1,
            maxLength:30,
            pattern:/^\s*\w*\s*$/ };
        $scope.email = Global.user.email;
        $scope.editable = false;

        $scope.toggleEdit = function(){
            $scope.editable= !$scope.editable;
        };

        $scope.updateCodeName = function(){
            $scope.toggleEdit();
            UsersAPI.profile.update({codeName:$scope.codeNameInput.value}, Global.user, function(){
                Global.user.codeName = $scope.codeNameInput.value;
                Global.user.isManufacturer = false;
                $scope.setCodeName();
                $rootScope.$broadcast('changeUserStatus');

            });
        };

        $scope.checkValid = function(){
            $scope.codeNameInput.valid.lengthCheck = $scope.codeNameInput.value.length >= $scope.codeNameInput.minLength && $scope.codeNameInput.value.length <= $scope.codeNameInput.maxLength ;
            $scope.codeNameInput.valid.patternCheck= $scope.codeNameInput.pattern.test($scope.codeNameInput.value);
            $scope.codeNameInput.valid.valid = $scope.codeNameInput.valid.lengthCheck && $scope.codeNameInput.valid.patternCheck;
        };

        $scope.setCodeName = function(){
            $scope.codename = (Global.user.codeName === null) ? 'Not Assigned' : (Global.user.isManufacturer ? Global.user.codeName : Global.user.codeName + ' (pending)');
        };
        $scope.setCodeName();

    }])
;