angular.module('dynamicForms').directive('dfModel', function($compile, $templateCache, DfSchemaService) {
    return {
        restrict: 'EA',
        priority: 1100,
        compile: function(element, attrs) {
            element.removeAttr('df-model');

            var columns = DfSchemaService.extractColumns(attrs.dfSchema),
                mode = attrs.mode;

            var template = $templateCache.get('templates/column.html');

            _.each(columns, function(it) {
                element.append( $templateCache.get(it.template) || _.template(template)({column: it.column, layout: mode === 'summary' ? 'form' : 'form'}) );
            });
        }
    }
});