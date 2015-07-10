angular.module('dynamicForms').directive('dfEditControls', function() {
    return {
        restrict: 'A',
        require: '^dfColumn',
        templateUrl: 'directives/components/df-edit-controls.html'
    }
});