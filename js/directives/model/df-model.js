angular.module('dynamicForms').directive('dfModel', function($templateCache, DfSchemaService) {
    return {
        restrict: 'EA',
        priority: 1100,
        compile: function(tElement, tAttrs) {
            var columns = DfSchemaService.extractColumns(tAttrs.dfSchema),
                controller = tAttrs.dfController,
                model = tAttrs.dfModelInstance,
                mode = tAttrs.dfMode,
                form = tAttrs.ngForm;

            var template = $templateCache.get('templates/' + (tAttrs.dfTemplate || 'default') + '.html');

            _.each(columns, function(it) {
                var show = it.show ? _.template(it.show)({controller: controller, model: model}) : true;

                tElement.append( $templateCache.get(it.template) || _.template(template)({form: form, show: show, column: it.column, mode: mode}) );
            });
        }
    }
});