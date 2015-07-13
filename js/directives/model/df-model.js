angular.module('dynamicForms').directive('dfModel', function($templateCache, DfSchemaService) {
    return {
        restrict: 'EA',
        priority: 1100,
        compile: function(tElement, tAttrs) {
            var columns = DfSchemaService.extractColumns(tAttrs.dfSchema),
                mode = tAttrs.dfMode,
                form = tAttrs.ngForm;

            var template = $templateCache.get('templates/' + (tAttrs.dfTemplate || 'default') + '.html');

            _.each(columns, function(it) {
                tElement.append( $templateCache.get(it.template) || _.template(template)({form: form, column: it.column, mode: mode}) );
            });
        },
        controller: function ($scope, $element, $attrs) {

        }
    }
});