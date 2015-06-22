angular.module('dynamicForms').directive('dfValidation', function($compile, DfSchemaService) {
    return {
        restrict: 'EA',
        priority: 1025,
        compile: function(element, attrs) {
            var schema = element.closestAttribute('df-schema'),
                column = element.closestAttribute('df-column');
            var validation = DfSchemaService.extractValidation(schema, column);

            element.removeAttr('df-validation');
            element.addClass('validation-message');

            element.append(validation);
        }
    }
});