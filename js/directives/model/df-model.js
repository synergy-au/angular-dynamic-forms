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
                form = tAttrs.ngForm;

            _.each(schema, function(column) {
                var props = {controller: controller, column: column, form: form, mode: mode, model: model};

                var template = $templateCache.get(column.template) || $templateCache.get('templates/' + getTemplateDirectory(tAttrs) + resolveType(column.type));

                props.show = column.show ? _.template(column.show)(props) : true;

                tElement.append( _.template(template)(props) );
            });
        }
    }
});