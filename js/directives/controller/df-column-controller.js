/**
 * This controller manages the column's (input field) state.
 * Specifically between the read and edit states.
 */
angular.module('dynamicForms').controller('DfColumnController', ['$scope', '$element', 'Utils', function ($scope, $element, Utils) {
    var currentMode, input, savedValue;

    this.init = function(mode) {
        if (currentMode) {
            return;
        }
        setMode(mode);
    };

    this.registerInput = function(inputElem) {
        input = inputElem;
        toggleInputMode(currentMode);
    };

    this.startEdit  = function () {
        savedValue = input.val();
        setMode('edit');
    };

    this.cancelEdit  = function () {
        input.val(savedValue);
        input.triggerHandler('input');
        setMode('read');
    };

    this.saveEdit  = function () {
        if (!input.controller('ngModel').$valid) {
            return;
        }
        setMode('read');
    };

    this.readonly = function() {
        return currentMode === 'read';
    };

    var setMode = function(mode) {
        $element.toggleClass(
            Utils.classesForStates([currentMode, mode])
        );
        toggleInputMode(mode);
        currentMode = mode;
    };

    var toggleInputMode = function (mode) {
        if (input) {
            input.attr('disabled', mode === 'read');
        }
    };
}]);