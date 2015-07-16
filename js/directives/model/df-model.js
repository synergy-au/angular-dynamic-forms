angular.module('dynamicForms').directive('dfModel', function($injector, $templateCache, DfUtils) {
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
            var schema = DfUtils.getDependency(tAttrs.dfSchema),
                controller = tAttrs.dfController,
                model = tAttrs.dfModelInstance,
                mode = tAttrs.dfMode,
                form = tAttrs.ngForm,
                templateDir = getTemplateDirectory(tAttrs);

            var props = {controller: controller, form: form, mode: mode, model: model};

            var wrapper = _.template($templateCache.get('templates/' + templateDir + '/wrapper.html'))(props);
            var wrapperElement = angular.element(wrapper);
            tElement.prepend(wrapperElement);

            _.each(schema, function(column) {
                props.column = column;

                var template = $templateCache.get(column.template) || $templateCache.get('templates/' + templateDir + resolveType(column.type));

                props.show = column.show ? _.template(column.show)(props) : true;

                wrapperElement.find('mainform').append( _.template(template)(props) );
            });
        }
    }
});