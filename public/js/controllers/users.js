'use strict';

angular.module('ace.users').controller('UsersController', ['$scope', '$routeParams', '$location', 'Global', 'Users', function ($scope, $routeParams, $location, Global, Users) {
    $scope.init = function(){
        if (!Global.authenticated || !Global.user.isAdmin)
            window.location.replace('/');
        $scope.global = Global;
        $scope.showMan = true;
        $scope.showUser = true;
        

        $scope.find = function() {
            Users.query(function(users) {
                $scope.users = users;
            });
        };

        
        $scope.custom = function(user)
        {
            var input1 = $scope.showUser;
            var input2 = $scope.showMan;
            if(!input1 && user.isAdmin === true)
            {
                return false;
            }
            else if(!input2 && user.isManufacturer === true)
            {
                return false;
            }
            return true;
        };
        
    };
    $scope.init();
}]);