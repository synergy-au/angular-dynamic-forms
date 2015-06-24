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
        toggleInput(currentMode);
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
        if (!input.val()) {
            return;
        }
        setMode('read');
    };

    this.readonly = function() {
        return currentMode === 'read';
    };

    var setMode = function(mode) {
        $element.toggleClass(
            Utils.classesFor(currentMode, mode)
        );
        toggleInput(mode);
        currentMode = mode;
    };

    var toggleInput = function (mode) {
        if (input) {
            input.attr('disabled', mode === 'read');
        }
    };
}]);