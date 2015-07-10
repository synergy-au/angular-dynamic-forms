angular.module('dynamicForms').directive('dfColumn', function() {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element.closestAttribute( 'df-mode' ) || 'write');
        },
        controller: 'DfColumnController',
        controllerAs: 'columnCtrl'
    }
});