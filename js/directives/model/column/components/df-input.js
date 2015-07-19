angular.module('dynamicForms').directive('dfInput', function($compile, DfSchemaService) {

    return {
        restrict: 'A',
        priority: 1050,
        require: '^dfColumn',
        compile: function(tElement, attrs) {
            tElement.removeAttr('df-input');

            // Retrieve details
            var props = DfSchemaService.getInputProps(tElement);

            if (props.columnDetails.show) {
                var optionalExpression = _.template(props.columnDetails.show)(props);
                props.validators["ng-required"] = "(" + optionalExpression + ") " + " && (" +  props.validators["ng-required"] + ")";
            }

            _.each(props.validators, function(val,key) {
                tElement.attr(key, _.template(val)(props));
            });

            // Bind to the model.
            tElement.attr( "ng-model", props.model + "." + props.column );

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