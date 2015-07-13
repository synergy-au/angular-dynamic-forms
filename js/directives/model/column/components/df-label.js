angular.module('dynamicForms').directive('dfLabel', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            DfSchemaService.prependColumnValue(element, 'label');
            var column = DfSchemaService.findColumn(element);
            element.attr('for', column)
        }
    }
});