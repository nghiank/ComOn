'use strict';

//Setting up route
angular.module('ace').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'views/index.html'
        }).
        when('/users', {
            templateUrl: 'views/Users/list.html'
        }).
        when('/profile/:username', {
            templateUrl: 'views/profile.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
]);

//Setting HTML5 Location Mode
angular.module('ace').config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
]);

//Setting translate Dictionary
angular.module('ace')
.config(['$translateProvider', function($translateProvider) {
    $translateProvider.preferredLanguage('en');
    $translateProvider.useStaticFilesLoader({
        prefix: '/language/',
        suffix: '.json'
    });
}]);