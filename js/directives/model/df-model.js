angular.module('dynamicForms').directive('dfModel', function($injector, $templateCache, DfUtils, DfSchemaService) {
    function resolveType (column) {
        var type = column.customType || column.type;
        switch(type) {
            case 'radio':
                return '/radio.html';
            case 'inputgroup':
                return '/inputgroup.html';
            case 'terms':
                return '/terms.html';
            case 'checkbox':
                return '/checkbox.html';
            default:
                return '/input.html';
        }
    }

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
            var wrapperElement = angular.element(wrapper);

            tElement.prepend(wrapperElement);

            _.each(schema, function(column) {
                props.column = column;

                var template = $templateCache.get(column.template) || $templateCache.get('templates/' + templateDir + resolveType(column));

                props.show = column.show ? _.template(column.show)(props) : true;

                wrapperElement.find('mainform').append( _.template(template)(props) );
            });
        }
    }
});