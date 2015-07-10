angular.module('dynamicForms').directive('dfLabel', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        priority: 1075,
        compile: function(element) {
            DfSchemaService.prependColumnValue(element, 'label');
            var column = DfSchemaService.findColumn(element);
            element.attr('for', column)
        }
    }
});