'use strict';

angular.module('ace.schematic')
.controller('versionListCtrl', ['$scope', 'SchematicsAPI', '$modalInstance', 'target', function ($scope, SchematicsAPI, $modalInstance,target) {

    $scope.target = target;

    $scope.init = function(){
        SchematicsAPI.nodeVersion.save({_id:$scope.target._id},function(response){
            $scope.versionInfo = response;
            console.log(response);
        });
    };

    $scope.cancel = function(){
        $modalInstance.dismiss('Cancelled by User');
    };

}]);
