angular.module('dynamicForms').directive('dfValidation', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        priority: 1025,
        compile: function(element, attrs) {
            DfSchemaService.appendColumnValue(element, 'validation');
        }
    }
});