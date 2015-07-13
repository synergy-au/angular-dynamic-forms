angular.module('dynamicForms', [])

angular.element.prototype.closestAttribute = function (attr) {

    var self = this;

    if (!self.parent() || self.parent()[0].nodeName.toLowerCase() === 'body') {
        return undefined;
    }

    if (self.parent().attr(attr)) {
        return self.parent().attr(attr);
    } else {
        return self.parent().closestAttribute(attr);
    }
};
// TODO Contain all logic in here.
angular.module('dynamicForms').service('DfSchemaService', function (DfUtils, $injector) {
    var defaults =  $injector.has('dynamicFormDefaults')  ? $injector.get('dynamicFormDefaults') : function(column) {
        return {
            "ng-focus": "columnCtrl.onInputFocus()",
            "ng-required": true,
            "type": "text",
            "id": column,
            "name": column
        };
    };

    this.findSchema = function(element) {
        return DfUtils.getDependency(element.closestAttribute('df-schema'));
    };
    this.findColumn = function(element) {
        return element.closestAttribute('df-column');
    };

    this.extractValue = function(element, key) {
        var schema = this.findSchema(element);
        return _(schema)
            .where({column: this.findColumn(element)})    // pluck value
            .pluck(key)
            .value().pop();
    };

    this.extractColumns = function(schema) {
        var schema = $injector.get(schema);
        return _.map(schema, function(it){
            return { column: it.column, template: it.template };
        });
    };

    this.extractColumn = function(schema, column) {
        var schema = $injector.get(schema);
        return _.find(schema, {column: column});
    };

    this.extractValidators = function(schema, column) {
        var schema = $injector.get(schema);

        return _.chain(schema)
                    .where({column: column})
                    .pluck('validators')
                    .map(function(validators){
                        return _.defaults(validators || {}, defaults(column));
                    }).value().pop();
    };

    this.prependColumnValue = function(element, key) {
        var value = this.extractValue(element, key);
        element.prepend(value);
    };
    this.appendColumnValue = function(element, key) {
        var value = this.extractValue(element, key);
        element.append(value);
    };
});
angular.module('dynamicForms').service('DfUtils', function ($injector) {
    var classes = {
        forMode: {
            write: 'df-column-write',
            read: 'df-column-read',
            edit: 'df-column-edit'
        }
    };

    this.classForState = function (state) {
        return classes.forMode[state];
    };

    this.classesForStates = function (states) {
        return _(states).map(function(state) {
            return classes.forMode[state];
        }).unique().value().join(' ');
    };

    this.getDependency = function(dependencyName) {
        return dependencyName ? $injector.get(dependencyName) : undefined;
    }
});
angular.module("dynamicForms").run(["$templateCache", function($templateCache) {$templateCache.put("templates/default.html","<div class=\"df-column\" df-column=\"<%= column %>\" df-mode=\"<%= mode %>\">\r\n\r\n    <label df-label class=\"df-label\"></label>\r\n\r\n    <div>\r\n        <input df-input class=\"df-input\" />\r\n        <div class=\"messages\">\r\n            <div df-edit class=\"df-edit\"></div>\r\n            <div df-help class=\"df-help\"></div>\r\n            <div df-validation class=\"df-validation\"></div>\r\n        </div>\r\n    </div>\r\n\r\n    <div df-edit-controls class=\"df-edit-controls\"></div>\r\n\r\n</div>");
$templateCache.put("templates/npw.html","<div class=\"field-group\" df-column=\"<%= column %>\" df-mode=\"<%= mode %>\"\r\n     ng-class=\"{\'field-group-tooltip--active\': columnCtrl.displayHelp(), \'field-group--error\': <%= form %>.<%= column %>.$invalid}\">\r\n\r\n    <div class=\"form-input-container\">\r\n        <label class=\"form-label\" df-label></label>\r\n        <input type=\"text\" class=\"form-input\" df-input>\r\n    </div>\r\n\r\n\r\n    <button type=\"button\" class=\"form-tooltip-toggle\" ng-click=\"columnCtrl.toggleHelp()\">\r\n        <span>Show help information</span>\r\n    </button>\r\n\r\n    <!--Help-->\r\n    <div class=\"form-tooltip form-tooltip--feature-aside\" df-help>\r\n    </div>\r\n\r\n    <!--Validation-->\r\n    <div class=\"form-error\" df-validation>\r\n    </div>\r\n</div>\r\n");
$templateCache.put("directives/model/column/components/df-edit-controls.html","<button class=\"df-cancel-edit\" ng-click=\"columnCtrl.cancelEdit()\">\r\n    Cancel\r\n</button>\r\n<button class=\"df-save-edit\" ng-click=\"columnCtrl.saveEdit()\">\r\n    Save\r\n</button>");
$templateCache.put("directives/model/column/components/df-edit.html","<button class=\"df-edit-button\" ng-click=\"columnCtrl.startEdit()\" ng-if=\"columnCtrl.isReadonly()\">\r\n    Edit\r\n</button>");}]);
angular.module('dynamicForms').directive('dfModel', function($templateCache, DfSchemaService) {
    return {
        restrict: 'EA',
        priority: 1100,
        compile: function(tElement, tAttrs) {
            var columns = DfSchemaService.extractColumns(tAttrs.dfSchema),
                mode = tAttrs.dfMode,
                form = tAttrs.ngForm;

            var template = $templateCache.get('templates/' + (tAttrs.dfTemplate || 'default') + '.html');

            _.each(columns, function(it) {
                tElement.append( $templateCache.get(it.template) || _.template(template)({form: form, column: it.column, mode: mode}) );
            });
        },
        controller: function ($scope, $element, $attrs) {

        }
    }
});
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
angular.module('dynamicForms').directive('dfColumn', function() {
    return {
        restrict: 'A',
        scope: true,
        controller: 'DfColumnController',
        controllerAs: 'columnCtrl'
    }
});
angular.module('dynamicForms').directive('dfEditControls', function() {
    return {
        restrict: 'A',
        require: '^dfColumn',
        templateUrl: 'directives/model/column/components/`df-edit-controls.html`'
    }
});
angular.module('dynamicForms').directive('dfEdit', function() {
    return {
        restrict: 'A',
        require: '^dfColumn',
        templateUrl: 'directives/model/column/components/df-edit.html'
    }
});
angular.module('dynamicForms').directive('dfHelp', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            DfSchemaService.appendColumnValue(element, 'help');
        }
    }
});
angular.module('dynamicForms').directive('dfInput', function($compile, DfSchemaService) {

    function swapInputForSelectIfNeeded (columnDefinition, element) {
        if ( columnDefinition && columnDefinition.type && columnDefinition.type !== 'select' ) {
            var cssClass = element.attr('class')
            var input = angular.element('<select class="' + cssClass + '"></select>');
            element.replaceWith(input);
            return input;
        }
        return element;
    }

    return {
        restrict: 'A',
        priority: 1050,
        require: '^dfColumn',
        compile: function(element, attrs) {
            var input;
            element.removeAttr('df-input');

            // Retrieve details
            var schema = element.closestAttribute('df-schema'),
                column = element.closestAttribute('df-column'),
                instance = element.closestAttribute('df-model-instance') || 'model',
                controller = element.closestAttribute('df-controller'),
                mode = element.closestAttribute( 'df-mode' ) || 'write',
                model = element.closestAttribute('df-model-instance');

            // Check if we need to swap in a select
            var columnDefinition = DfSchemaService.extractColumn(schema, column);
            input = swapInputForSelectIfNeeded(columnDefinition, element);

            // Attach validators using defaults where needed.
            var validators = DfSchemaService.extractValidators(schema, column);
            _.each(validators, function(val,key) {
                input.attr(key, _.template(val)({controller: controller, model: model}));
            });

            // Bind to the model.
            input.attr( "ng-model", instance + "." + column );

            return {
                pre: function(scope, iElem){
                    $compile(iElem)(scope);
                },
                post: function(scope, iElem, iAttrs, columnCtrl){
                    columnCtrl.registerInput(element);
                }
            }
        }
    }
});
angular.module('dynamicForms').directive('dfLabel', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            DfSchemaService.prependColumnValue(element, 'label');
            var column = DfSchemaService.findColumn(element);
            element.attr('for', column)
        }
    }
});
angular.module('dynamicForms').directive('dfValidation', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            DfSchemaService.appendColumnValue(element, 'validation');
        }
    }
});