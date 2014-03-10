'use strict';

angular.module('ace.schematic')
.controller('addGrpFormCtrl', ['$timeout', '$scope','$location', '$upload', 'DatParser', 'Global', '$http', 'Schematics', '$modalInstance', '$modal', 'parent', function ($timeout, $scope, $location, $upload, ParseDat, Global, $http, Schematics, $modalInstance, $modal, parent) {
    $scope.target = {};
    $scope.global = Global;
    $scope.httpMethod = 'POST';
    $scope.error = {};
    $scope.success = {};
    $scope.id = null;
    $scope.valid = {'name':false,'thumbnail':false,'dl':false,'id':false};
    $scope.createDisabled = true;

    $scope.imgPreview = '';

    $scope.$watch('valid.thumbnail',function(){
        if($scope.target.thumbnail && $scope.valid.thumbnail){
            $scope.imgPreview = '<img src="'.concat($scope.target.thumbnail, '"/>');
        }
        else
            $scope.imgPreview = '';
    });

    $scope.$watchCollection('[valid.name,valid.id,valid.thumbnail]',function(){
        $scope.createDisabled = !($scope.valid.name && $scope.valid.id && $scope.valid.thumbnail);
    });

    $scope.abort = function(index) {
        $scope.upload[index].abort();
        $scope.upload[index] = null;
    };

    $scope.hasUploader = function(index) {
        return $scope.upload[index] !== null;
    };

    $scope.validateThumbnail = function(){
        $scope.valid.thumbnail = false;
        $scope.error.thumbnail = null;
        if($scope.target.thumbnail)
        {
            var thumbnailPattern = new RegExp('^.*\\.(bmp|jpeg|jpg|ico)$');
            if(!thumbnailPattern.test($scope.target.thumbnail))
            {
                $scope.valid.thumbnail = false;
                $scope.error.thumbnail = 'Not an image.';
                return;
            }
            $http.get($scope.target.thumbnail)
            .success(function(){
                $scope.valid.thumbnail = true;
            })
            .error(function(){
                $scope.valid.thumbnail = false;
                $scope.error.thumbnail = 'The link is broken.';
            });
        }
    };

    $scope.checkName = function(){
        $scope.error.name = null;
        $scope.success.name = null;
        $scope.valid.name = false;
        if(!$scope.target.name)
        {
            return;
        }
        if($scope.target.name.length > 30) //Later check against all the other standard names too
        {
            $scope.error.name = 'Invalid name.';
            $scope.$apply();
            return;
        }

        Schematics.children.get({nodeId:parent._id}, function(comps) {
            if(comps){
                for (var i = 0; i < comps.children.length; i++){
                    var dbName = comps.children[i].name.toUpperCase();
                    var localName = $scope.target.name.toUpperCase();
                    if(dbName.localeCompare(localName) === 0 && $scope.target._id !== comps.children[i]._id){
                        $scope.valid.name = false;
                        $scope.error.name = 'This name already exists within the same group.';
                        return;
                    }
                }
            }
            $scope.valid.name = true;
            $scope.success.name = 'This is a valid name.';
        });
    };

    $scope.checkId = function(){
        $scope.error.id = null;
        $scope.success.id = null;
        if(!$scope.target.id)
            return;
        $scope.target.id = $scope.target.id.toUpperCase();
        Schematics.checkId.save({id:$scope.target.id, standardId:parent.standard},function(response){
            if(response.unique === true){
                $scope.valid.id = true;
            }
            else{
                $scope.valid.id = false;
                $scope.error.id = 'This id already exists within the same group.';
            }
        });
    };

    $scope.createComp = function(){
        $scope.target.isComposite = true;
        $scope.target.parentNode = parent._id;
        $scope.target.standard = parent.standard;
        $scope.target.dl = null;
        console.log('target:',$scope.target);
        Schematics.createNode.save({node:$scope.target}, function(response){
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
