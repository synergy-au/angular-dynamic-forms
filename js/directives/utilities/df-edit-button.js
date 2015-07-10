angular.module('dynamicForms').directive('dfEditButton', function() {
    return {
        restrict: 'A',
        require: '^dfColumn',
        templateUrl: 'directives/components/df-edit.html',
        link: function(scope, element, attrs, columnCtrl) {
            columnCtrl.registerInput(element);
        }
    }
});