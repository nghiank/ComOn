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
    $translateProvider.translations({
        'CODE_NAME_INFO_TITLE': 'What is CODE name?',
        'CODE_NAME_INFO':'Code name is optional information only applicable for manufacturers.Code name appears in the field "manufacturer" in your catalog. By changing your default CODE name, you automatically apply to register as an manufacturer. Your new CODE name is only confirmed after the verfication from the administrator.'
    });
}]);