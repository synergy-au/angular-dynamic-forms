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
                var template = $templateCache.get('templates/' + tAttrs.dfTemplate + resolveType(column.type));

                var show = column.show ? _.template(column.show)({controller: controller, model: model, column: column, mode: mode}) : true;

                tElement.append( $templateCache.get(column.template) || _.template(template)({column: column, form: form, show: show, mode: mode}) );
            });
        }
    }
});