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

//Setting up interceptor
angular.module('ace').config(['$httpProvider',
    function($httpProvider) {
        function Interceptor($q) {
            function success(response) {
                return response;
            }
            function error(response) {
                var status = response.status;
                if(status === 401) {
                    window.alert('You are not authorized to view this page.');
                    window.location = '/';
                    return;
                }
                return $q.reject(response); //similar to throw response;
            }
            return function(promise) {
                return promise.then(success, error);
            };
        }
        $httpProvider.responseInterceptors.push(Interceptor);
    }
]);

