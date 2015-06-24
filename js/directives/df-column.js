angular.module('dynamicForms').directive('dfColumn', function(Utils) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var mode = element.closestAttribute( 'df-mode' ) || 'write';

            element.addClass("df-column " + Utils.classFor(mode));

        }
    }
});