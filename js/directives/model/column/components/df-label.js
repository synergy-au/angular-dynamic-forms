angular.module('dynamicForms').directive('dfLabel', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        priority: 1000,
        compile: function(tElement) {
            DfSchemaService.prependColumnValue(tElement, 'label');
            var column = DfSchemaService.findColumn(tElement);
            tElement.attr('for', column)
        }
    }
});