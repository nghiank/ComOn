'use strict';

angular.module('ace.users').controller('UsersController', ['$scope', '$routeParams', '$location', 'Global', 'Users', function ($scope, $routeParams, $location, Global, Users) {

    $scope.init = function(){
        if (!Global.authenticated || !Global.user.isAdmin)
            window.location.replace('/');

        $scope.global = Global;
        $scope.showMan = true;
        $scope.showUser = true;

        $scope.update = function(id) {

            var users = $scope.users;
            var index = 0;
            for(var i in users)
            {
                if(users[i]._id === id)
                {
                    index = i;
                    break;
                }
            }
            Users.update({userId: id}, function(user) {
                users[index] = user;
                if(user._id === Global.user._id){
                    Global.user.codeName = user.codeName;
                    Global.user.isManufacturer = user.isManufacturer;
                }
                $scope.users[i].name += ($scope.users[i].codeName ===null) ? '': ' ('+$scope.users[i].codeName+')';

            });
        };

        $scope.find = function() {
            Users.query(function(users) {
                $scope.users = users;
                var i;
                for (i = 0; i < $scope.users.length; i++)
                    $scope.users[i].name += ($scope.users[i].codeName ===null) ? '': ' ('+$scope.users[i].codeName+')';
            });
        };

        $scope.custom = function(user)
        {
            var input1 = $scope.showUser;
            var input2 = $scope.showMan;
            if(!input1 && user.isAdmin === true)
            {
                if(input2 && user.isManufacturer)
                {
                    return true;
                }
                return false;
            }
            if(!input2 && user.isManufacturer === true)
            {
                if(input1 && user.isAdmin)
                {
                    return true;
                }
                return false;
            }
            return true;
        };
    };
    $scope.init();
}]);