angular.module('dynamicForms').directive('dfInput', function($compile, DfSchemaService) {

    return {
        restrict: 'A',
        priority: 1050,
        require: '^dfColumn',
        compile: function(element, attrs) {
            element.removeAttr('df-input');

            // Retrieve details
            var schema = element.closestAttribute('df-schema'),
                column = element.closestAttribute('df-column'),
                model = element.closestAttribute('df-model-instance') || 'model',
                controller = element.closestAttribute('df-controller'),
                mode = element.closestAttribute( 'df-mode' ) || 'write';

            // Check if we need to swap in a select
            var columnDefinition = DfSchemaService.extractColumn(schema, column);

            // Attach validators using defaults where needed.
            var validators = DfSchemaService.extractValidators(schema, column);
            if (columnDefinition.show) {
                var optionalExpression = _.template(columnDefinition.show)({controller: controller, model: model, mode: mode});
                validators["ng-required"] = "(" + optionalExpression + ") " + " && (" +  validators["ng-required"] + ")";
            }

            _.each(validators, function(val,key) {
                element.attr(key, _.template(val)({controller: controller, model: model}));
            });

            // Bind to the model.
            element.attr( "ng-model", model + "." + column );

            return {
                pre: function(scope, iElem){
                    $compile(iElem)(scope);
                },
                post: function(scope, iElem, iAttrs, columnCtrl){
                    columnCtrl.registerInput(iElem);
                }
            }
        }
    }
});