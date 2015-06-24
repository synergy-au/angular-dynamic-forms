angular.module('dynamicForms').directive('dfEditControls', function() {
    return {
        restrict: 'C',
        require: '^dfColumn',
        templateUrl: 'templates/edit-controls.html'
    }
});