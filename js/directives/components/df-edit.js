angular.module('dynamicForms').directive('dfEdit', function() {
    return {
        restrict: 'A',
        require: '^dfColumn',
        templateUrl: 'directives/components/df-edit.html'
    }
});