angular.module('dynamicForms').directive('dfEditControls', function() {
    return {
        restrict: 'A',
        require: '^dfColumn',
        templateUrl: 'directives/model/column/components/`df-edit-controls.html`'
    }
});