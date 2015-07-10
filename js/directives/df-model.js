angular.module('dynamicForms').directive('dfModel', function($compile, $templateCache, DfSchemaService) {
    return {
        restrict: 'EA',
        priority: 1100,
        compile: function(element, attrs) {
            var columns = DfSchemaService.extractColumns(attrs.dfSchema),
                mode = attrs.dfMode;

            var template = $templateCache.get('templates/' + (attrs.dfTemplate || 'default') + '.html');

            _.each(columns, function(it) {
                element.append( $templateCache.get(it.template) || _.template(template)({column: it.column, mode: mode}) );
            });
        }
    }
});