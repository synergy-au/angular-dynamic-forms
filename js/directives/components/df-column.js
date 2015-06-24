angular.module('dynamicForms').directive('dfColumn', function() {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs, ctrl) {
            element.addClass("df-column");
            ctrl.init(element.closestAttribute( 'df-mode' ) || 'write');
        },
        controller: 'DfColumnController',
        controllerAs: 'columnCtrl'
    }
});