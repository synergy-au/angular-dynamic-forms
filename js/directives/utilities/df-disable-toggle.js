angular.module('dynamicForms').directive('dfDisableToggle', function() {
    return {
        restrict: 'A',
        require: '^dfColumn',
        templateUrl: 'templates/edit.html',
        link: function(scope, element, attrs, columnCtrl) {
            columnCtrl.registerInput(element);
        }
    }
});