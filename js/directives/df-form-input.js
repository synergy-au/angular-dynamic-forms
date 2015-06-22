angular.module('dynamicForms').directive('dfFormInput', function(DfSchemaService) {
    return {
        restrict: 'C',
        link: function(scope, element, attrs) {
            var mode = element.closestAttribute( 'df-mode' ) || 'write';

            if (mode === 'summary') {
                element.attr( 'disabled', true );
            }
        }
    }
});