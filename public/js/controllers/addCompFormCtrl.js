'use strict';

angular.module('ace.schematic')
.controller('addCompFormCtrl', ['formValidation', '$timeout', '$scope','$location', '$upload', 'Global', '$http', 'SchematicsAPI', '$modalInstance', '$modal', 'parent', function (formValidation, $timeout, $scope, $location, $upload, Global, $http, SchematicsAPI, $modalInstance, $modal, parent) {
    $scope.target = {};
    $scope.global = Global;
    $scope.httpMethod = 'POST';
    $scope.error = {};
    $scope.success = {};
    $scope.id = null;
    $scope.valid = {'name':false,'thumbnail':false,'dl':false,'id':false};
    $scope.createDisabled = true;
    $scope.formValidator = formValidation;
    $scope.imgPreview = '';

    $scope.$watch('valid.thumbnail',function(){
        if($scope.target.thumbnail && $scope.valid.thumbnail){
            $scope.imgPreview = '<img src="'.concat($scope.target.thumbnail, '"/>');
        }
        else
        {
            $scope.imgPreview = '';
        }
    });

    $scope.$watchCollection('valid',function(){
        $scope.createDisabled = !($scope.valid.name && $scope.valid.id && $scope.valid.dl && $scope.valid.thumbnail);
    });


    $scope.validateThumbnail = function(){
        $scope.valid.thumbnail = undefined;
        $scope.success.thumbnail = null;
        $scope.error.thumbnail = null;
        var string = $scope.target.thumbnail;
        if(!string)
            return;
        var check = $scope.formValidator.checkFileExtension(string, ['bmp', 'jpeg', 'jpg', 'png', 'ico']);
        if(check.result)
        {
            $scope.formValidator.validateLink(string, function(result) {
                $scope.success.thumbnail = result.suc_message;
                $scope.valid.thumbnail = result.result;
                $scope.error.thumbnail = result.err_message;
            });
            return;
        }
        $scope.success.thumbnail = check.suc_message;
        $scope.valid.thumbnail = check.result;
        $scope.error.thumbnail = check.err_message;
    };

    $scope.validateDwg = function(){
        $scope.valid.dl = false;
        $scope.error.dl = null;
        $scope.success.dl = null;
        var string = $scope.target.dl;
        if(!string)
            return;
        var check = $scope.formValidator.checkFileExtension(string, ['dwg']);
        if(check.result)
        {
            $scope.formValidator.validateLink(string, function(result) {
                $scope.success.dl = result.suc_message;
                $scope.valid.dl = result.result;
                $scope.error.dl = result.err_message;
            });
            return;
        }
        $scope.success.dl = check.suc_message;
        $scope.valid.dl = check.result;
        $scope.error.dl = check.err_message;
    };

    $scope.checkName = function(){
        $scope.error.name = null;
        $scope.success.name = null;
        $scope.valid.name = undefined;
        var data = $scope.target.name;
        if(!data)
            return;
        $scope.formValidator.checkSchematicNodeName(data, parent._id, function(check) {
            $scope.valid.name = check.result;
            $scope.error.name = check.err_message;
            $scope.success.name = check.suc_message;
        });
    };

    $scope.checkId = function(){
        $scope.error.id = null;
        $scope.success.id = null;
        $scope.valid.id = undefined;
        if(!$scope.target.id)
            return;
        $scope.target.id = $scope.target.id.toUpperCase();
        var data = $scope.target.id;
        $scope.formValidator.checkUniqueSchematicId(data, parent.standard, function(check) {
            $scope.valid.id = check.result;
            $scope.error.id = check.err_message;
            $scope.success.id = check.suc_message;
        });
    };

    $scope.createComp = function(){
        $scope.target.isComposite = false;
        $scope.target.parentNode = parent._id;
        $scope.target.standard = parent.standard;
        SchematicsAPI.createNode.save({node:$scope.target}, function(response){
            if(response)
            {
                console.log('Create Success!');
                $modalInstance.close();
            }
        });
    };

    $scope.cancel = function(){
        $modalInstance.dismiss('Cancelled by User');
    };

}]);
