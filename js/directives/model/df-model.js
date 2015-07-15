angular.module('dynamicForms').directive('dfModel', function($templateCache, DfUtils) {
    function resolveType (type) {
        switch(type) {
            case 'radio':
                return '/radio.html';
            case 'inputgroup':
                return '/inputgroup.html';
            case 'checkbox':
                return '/checkbox.html';
            default:
                return '/input.html';
        }
    }

    return {
        restrict: 'EA',
        priority: 1100,
        compile: function(tElement, tAttrs) {
            var schema = DfUtils.getDependency(tAttrs.dfSchema),
                controller = tAttrs.dfController,
                model = tAttrs.dfModelInstance,
                mode = tAttrs.dfMode,
                form = tAttrs.ngForm;

            _.each(schema, function(column) {
                var props = {controller: controller, column: column, form: form, mode: mode};

                var template = $templateCache.get(column.template) || $templateCache.get('templates/' + tAttrs.dfTemplate + resolveType(column.type));

                props.show = column.show ? _.template(column.show)(props) : true;

                tElement.append( _.template(template)(props) );
            });
        }
    }
});