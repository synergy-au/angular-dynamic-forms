/**
 * This controller manages the column's (input field) state.
 * Specifically between the read and edit states.
 */
angular.module('dynamicForms').controller('DfColumnController', ['$scope', '$element', '$rootScope', 'DfUtils', function ($scope, $element, $rootScope, DfUtils) {
    var model = {
        currentMode: $element.closestAttribute( 'df-mode' ) || 'write',
        element: $element,
        input: undefined,
        editable: true,
        savedValue: undefined,
        help: false
    };

    this.registerInput = function(inputElem, editable) {
        model.input = inputElem;
        model.editable = _.isUndefined(editable) ? model.editable : editable;
        toggleInputMode(model.currentMode);
    };

    this.allowEdit  = function () {
        return model.editable;
    };

    this.startEdit  = function () {
        model.savedValue = model.input.val();
        model.help = true;
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
        $rootScope.$broadcast('df_input_focus', model.input.attr('id'));
        model.help = true;
    };

    this.toggleHelp = function() {
        model.help = !model.help;
    };

    this.isReadonly = function() {
        return model.currentMode === 'read';
    };

    this.inEdit = function() {
        return model.currentMode === 'edit';
    };

    this.displayHelp = function() {
        return model.help;
    };

    var setMode = function(mode) {
        /*model.element.toggleClass(
            DfUtils.classesForStates([model.currentMode, mode])
        );*/
        toggleInputMode(mode);
        model.currentMode = mode;
    };

    var toggleInputMode = function (mode) {
        model.input.attr('readonly', mode === 'read');
    };

    $rootScope.$on('df_input_focus', function(val) {
        model.help = val === model.input.attr('id');
    });
}]);