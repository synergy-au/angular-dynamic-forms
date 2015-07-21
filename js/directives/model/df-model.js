angular.module('dynamicForms').directive('dfModel', ['$injector', '$templateCache', 'DfUtils', 'DfSchemaService', function($injector, $templateCache, DfUtils, DfSchemaService) {
    function getTemplateDirectory(tAttrs) {
        if (tAttrs.dfTemplate) {
            return tAttrs.dfTemplate;
        }
        var sessionService = $injector.has('DfSessionService') ? $injector.get('DfSessionService') : null;
        return sessionService && $injector.get(sessionService).isLoggedIn() ? 'myaccount' : 'npw';
    }

    return {
        restrict: 'EA',
        priority: 1100,
        compile: function(tElement, tAttrs) {
            var props = DfSchemaService.getSchemaProps(tAttrs)
            var schema = DfUtils.getDependency(props.schema);
            var templateDir = getTemplateDirectory(tAttrs);

            var wrapper = _.template($templateCache.get('templates/' + templateDir + '/wrapper.html'))(props);

            tElement.prepend( wrapper );

            _.each(schema, function(column) {
                props.column = column;

                // Use a manual template if provided , otherwise look for a custom template if it exists or else fallback to the standard input.
                var template = $templateCache.get(column.template) || $templateCache.get('templates/' + templateDir + "/" + (column.customType || column.type)  + ".html") || $templateCache.get('templates/' + templateDir + "/input.html");

                props.show = column.show ? _.template(column.show)(props) : true;

                tElement.find('mainform').append( _.template(template)(props) );
            });
        }
    }
}]);