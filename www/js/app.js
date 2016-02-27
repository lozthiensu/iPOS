angular.module('freePos', ['ui.router', 'oitozero.ngSweetAlert', 'LocalStorageModule', 'ngCordova', 'perfect_scrollbar', 'ngTouch'])
.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider 
        .state('page_Home', {
            url: '/page_Home',
            templateUrl: 'page_Home.html',
            controller: 'page_Home_Ctrl'
        })
		;
    $urlRouterProvider.otherwise('/page_Home');
});

 

