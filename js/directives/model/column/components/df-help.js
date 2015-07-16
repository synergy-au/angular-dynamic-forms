angular.module('dynamicForms').directive('dfHelp', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var helpImage = DfSchemaService.getColumnValue(element, 'helpImage');
            var help = DfSchemaService.getColumnValue(element, 'help');

            if (helpImage) {
                element.find('img').attr('src', helpImage)
            } else {
                element.find('img').remove();
            }

            if (help) {
                element.find('div').append(help);
            }

            $compile(element.contents())(scope);
        }
    }
});