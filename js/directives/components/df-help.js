angular.module('dynamicForms').directive('dfHelp', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        priority: 1050,
        compile: function(element, attrs) {
            DfSchemaService.appendColumnValue(element, 'help');
        }
    }
});