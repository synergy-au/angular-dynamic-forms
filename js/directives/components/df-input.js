angular.module('dynamicForms').directive('dfInput', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        priority: 1050,
        compile: function(element, attrs) {
            var schema = element.closestAttribute('df-schema'),
                column = element.closestAttribute('df-column'),
                instance = element.closestAttribute('df-model-instance') || 'model',
                controller = element.closestAttribute('df-controller'),
                mode = element.closestAttribute( 'df-mode' ) || 'write',
                model = element.closestAttribute('df-model-instance');

            var validators = DfSchemaService.extractValidators(schema, column),
                columnDefinition = DfSchemaService.extractColumn(schema, column);

            element.removeAttr('df-input');

            var input;
            if ((columnDefinition && columnDefinition['type']) === 'select') {
                input = angular.element('<select class="df-input"></select>');
                element.replaceWith(input);
            } else {
                input = element;
            }

            _.each(validators, function(val,key) {
                input.attr(key, _.template(val)({controller: controller, model: model}));
            });

            input.attr( "ng-model", instance + "." + column );

            return function (scope, input) {
                $compile(input)(scope);
            };
        }
    }
});