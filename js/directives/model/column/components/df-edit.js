angular.module('dynamicForms').directive('dfEdit', function() {
    return {
        restrict: 'A',
        require: '^dfColumn',
        templateUrl: 'directives/model/column/components/df-edit.html'
    }
});