angular.module('dynamicForms').directive('dfLabel', function($compile, DfSchemaService) {
    return {
        restrict: 'EA',
        priority: 1075,
        compile: function(element, attrs) {
            var schema = element.closestAttribute('df-schema'),
                column = element.closestAttribute('df-column');
            var label = DfSchemaService.extractLabel(schema, column);

            element.removeAttr('df-label');
            element.attr('for', column);

            element.prepend(label);
        }
    }
});