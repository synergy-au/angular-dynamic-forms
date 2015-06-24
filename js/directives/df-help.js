angular.module('dynamicForms').directive('dfHelp', function($compile, DfSchemaService) {
    return {
        restrict: 'EA',
        priority: 1050,
        compile: function(element, attrs) {
            var schema = element.closestAttribute('df-schema'),
                column = element.closestAttribute('df-column');
            var help = DfSchemaService.extractHelp(schema, column);

            element.removeAttr('df-help');
            element.addClass('df-help');

            element.append(help);
        }
    }
});