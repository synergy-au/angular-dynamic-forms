angular.module('dynamicForms').directive('dfValidation', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        priority: 1000,
        compile: function(tElement, tAttrs) {
            DfSchemaService.appendColumnValue(tElement, 'validation');
        }
    }
});