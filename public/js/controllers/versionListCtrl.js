'use strict';

angular.module('ace.schematic')
.controller('versionListCtrl', ['$scope', 'SchematicsAPI', '$modalInstance', 'target', function ($scope, SchematicsAPI, $modalInstance, target) {

    $scope.target = target;

    $scope.init = function(){
        SchematicsAPI.nodeVersion.save({_id: $scope.target._id},function(response){
            $scope.versionInfo = response;
        });
    };

    $scope.publishComponent = function(number) {
        if(!number)
            number = 0;
        SchematicsAPI.publish.save({_id: $scope.target._id, number: number}, function(response) {
            if(response)
                $modalInstance.close(true);
            else
                $modalInstance.close(false);
        });
    };

    $scope.cancel = function(){
        $modalInstance.dismiss('Cancelled by User');
    };

}]);
