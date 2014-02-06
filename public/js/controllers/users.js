'use strict';

angular.module('ace.users').controller('UsersController', ['$scope', '$routeParams', '$location', 'Global', 'Users', function ($scope, $routeParams, $location, Global, Users) {
    $scope.global = Global;
    $scope.showMan = true;
    $scope.showUser = true;
    // $scope.create = function() {
    //     // var article = new Articles({
    //     //     title: this.title,
    //     //     content: this.content
    //     // });
    //     // article.$save(function(response) {
    //     //     $location.path('articles/' + response._id);
    //     // });

    //     // this.title = '';
    //     // this.content = '';
    // };

    // $scope.remove = function() {
    //     // if (article) {
    //     //     article.$remove();

    //     //     for (var i in $scope.articles) {
    //     //         if ($scope.articles[i] === article) {
    //     //             $scope.articles.splice(i, 1);
    //     //         }
    //     //     }
    //     // }
    //     // else {
    //     //     $scope.article.$remove();
    //     //     $location.path('articles');
    //     // }
    // };

    // $scope.update = function() {
    //     // var article = $scope.article;
    //     // if (!article.updated) {
    //     //     article.updated = [];
    //     // }
    //     // article.updated.push(new Date().getTime());

    //     // article.$update(function() {
    //     //     $location.path('articles/' + article._id);
    //     // });
    // };

    $scope.find = function() {
        Users.query(function(users) {
            $scope.users = users;
        });
    };

    // $scope.findOne = function() {
    //     // Articles.get({
    //     //     articleId: $routeParams.articleId
    //     // }, function(article) {
    //     //     $scope.article = article;
    //     // });
    // };


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
}]);