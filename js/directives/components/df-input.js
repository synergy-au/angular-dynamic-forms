angular.module('dynamicForms').directive('dfInput', function($compile, DfSchemaService) {
    return {
        restrict: 'EA',
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

            input.attr( "ng-required", (validators && validators['ng-required']) || 'true' );
            input.attr( "type", (columnDefinition && columnDefinition['type']) || 'text' );
            input.attr( "id", column );
            input.attr( "name", column );
            input.attr( "ng-model", instance + "." + column );
            input.attr( "df-disable-toggle", "" );

            return function (scope, input) {
                $compile(input)(scope);
            };
        }
    }
});