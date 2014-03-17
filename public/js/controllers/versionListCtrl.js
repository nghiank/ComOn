'use strict';

angular.module('ace.schematic')
.controller('versionListCtrl', ['formValidation','$scope', 'SchematicsAPI', '$modalInstance', 'target', function (formValidation, $scope, SchematicsAPI, $modalInstance, target) {

    $scope.target = target;
    $scope.formValidator = formValidation;
    $scope.init = function(){
        SchematicsAPI.nodeVersion.save({_id: $scope.target._id},function(response){
            $scope.versionInfo = response;
        });
    };

    $scope.publishComponent = function(number) {
        if(!number)
            number = 0;
        if(number === $scope.target.published)
            return;
        $scope.formValidator.checkSchematicNodeName($scope.versionInfo.versions[number? (number - 1): 0].name, $scope.target.parentNode._id, function(check) {
            if(!check.result && number!== 0)
                return;
            $scope.formValidator.checkUniqueSchematicId($scope.versionInfo.versions[number? (number - 1): 0].id, $scope.target.standard._id, $scope.target._id, function(check) {
                if(!check.result && number!== 0)
                    return;
                SchematicsAPI.publish.save({_id: $scope.target._id, number: number}, function(response) {
                    if(response)
                        $modalInstance.close(true);
                    else
                        $modalInstance.close(false);
                });
            });
    
        });
    };

    $scope.chooseHoverTarget = function(index){
        $scope.hoverTgt = index;
        console.log($scope.hoverTgt);
    };

    $scope.cancel = function(){
        $modalInstance.dismiss('Cancelled by User');
    };

}]);
