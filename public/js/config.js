'use strict';


//Setting up route and client interceptor
angular.module('ace').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'views/index.html'
        }).
        when('/users', {
            templateUrl: 'views/Users/list.html'
        }).
        when('/profile', {
            templateUrl: 'views/profile.html'
        }).
        when('/upload', {
            templateUrl: 'views/upload.html'
        }).
        when('/schematics', {
            templateUrl: 'views/Schematics/all.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
]).run(function(Global, $rootScope, $location) {
    // register listener to watch route changes
    $rootScope.$on('$locationChangeStart', function() { //function(event, next, current)
        if (Global.authenticated === false) {
            var path = $location.$$path;
        // no logged user, can still browse the schematics
            if (path === '/' || path === '/schematics') {
                return;
            } else {
                // not going to #login, we should redirect now
                $location.path('/');
            }
        }
    });
});

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
                    window.location = '/';
                    return;
                }
                else if(status === 400) {
                    window.alert(response.data.error);
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


