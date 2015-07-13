angular.module('dynamicForms').directive('dfInput', function($compile, DfSchemaService) {

    function swapInputForSelectIfNeeded (columnDefinition, element) {
        if ( columnDefinition && columnDefinition.type && columnDefinition.type !== 'select' ) {
            var cssClass = element.attr('class')
            var input = angular.element('<select class="' + cssClass + '"></select>');
            element.replaceWith(input);
            return input;
        }
        return element;
    }

    return {
        restrict: 'A',
        priority: 1050,
        require: '^dfColumn',
        compile: function(element, attrs) {
            var input;
            element.removeAttr('df-input');

            // Retrieve details
            var schema = element.closestAttribute('df-schema'),
                column = element.closestAttribute('df-column'),
                instance = element.closestAttribute('df-model-instance') || 'model',
                controller = element.closestAttribute('df-controller'),
                mode = element.closestAttribute( 'df-mode' ) || 'write',
                model = element.closestAttribute('df-model-instance');

            // Check if we need to swap in a select
            var columnDefinition = DfSchemaService.extractColumn(schema, column);
            input = swapInputForSelectIfNeeded(columnDefinition, element);

            // Attach validators using defaults where needed.
            var validators = DfSchemaService.extractValidators(schema, column);
            _.each(validators, function(val,key) {
                input.attr(key, _.template(val)({controller: controller, model: model}));
            });

            // Bind to the model.
            input.attr( "ng-model", instance + "." + column );

            return {
                pre: function(scope, iElem){
                    $compile(iElem)(scope);
                },
                post: function(scope, iElem, iAttrs, columnCtrl){
                    columnCtrl.registerInput(element);
                }
            }
        }
    }
});