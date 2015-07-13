angular.module('dynamicForms').directive('dfValidation', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            DfSchemaService.appendColumnValue(element, 'validation');
        }
    }
});