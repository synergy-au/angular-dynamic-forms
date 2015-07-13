angular.module('dynamicForms').directive('dfHelp', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            DfSchemaService.appendColumnValue(element, 'help');
        }
    }
});