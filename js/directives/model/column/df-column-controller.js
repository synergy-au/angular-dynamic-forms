/**
 * This controller manages the column's (input field) state.
 * Specifically between the read and edit states.
 */
angular.module('dynamicForms').controller('DfColumnController', ['$scope', '$element', 'DfUtils', function ($scope, $element, DfUtils) {
    var model = {
        currentMode: $element.closestAttribute( 'df-mode' ) || 'write',
        element: $element,
        input: undefined,
        savedValue: undefined,
        help: false
    };

    this.registerInput = function(inputElem) {
        model.input = inputElem;
        toggleInputMode(model.currentMode);
    };

    this.startEdit  = function () {
        model.savedValue = model.input.val();
        setMode('edit');
    };

    this.cancelEdit  = function () {
        model.input.val(model.savedValue);
        model.input.triggerHandler('input');
        setMode('read');
    };

    this.saveEdit  = function () {
        if (!model.input.controller('ngModel').$valid) {
            return;
        }
        setMode('read');
    };

    this.onInputFocus = function() {
        model.help = true;
    };

    this.toggleHelp = function() {
        model.help = !model.help;
    };

    this.isReadonly = function() {
        return model.currentMode === 'read';
    };

    this.displayHelp = function() {
        return model.help;
    };

    var setMode = function(mode) {
        model.element.toggleClass(
            DfUtils.classesForStates([model.currentMode, mode])
        );
        toggleInputMode(mode);
        model.currentMode = mode;
    };

    var toggleInputMode = function (mode) {
        model.input.attr('disabled', mode === 'read');
    };
}]);