angular.module('dynamicForms').directive('dfColumn', function() {
    return {
        restrict: 'A',
        scope: true,
        controller: 'DfColumnController',
        controllerAs: 'columnCtrl'
    }
});