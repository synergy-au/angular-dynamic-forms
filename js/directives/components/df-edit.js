angular.module('dynamicForms').directive('dfEdit', function() {
    return {
        restrict: 'C',
        require: '^dfColumn',
        templateUrl: 'templates/edit.html'
    }
});