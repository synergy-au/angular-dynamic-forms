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
            "type": column.type || "text",
            "id": column.name,
            "name": column.name
        };
    };

    this.findSchema = function(element) {
        return DfUtils.getDependency(element.closestAttribute('df-schema'));
    };
    this.findColumn = function(element) {
        return element.attr('df-column') || element.closestAttribute('df-column');
    };

    this.extractValue = function(element, key) {
        var schema = this.findSchema(element);
        return _(schema)
            .where({name: this.findColumn(element)})    // pluck value
            .pluck(key)
            .value().pop();
    };

    this.extractColumn = function(schema, column) {
        var schema = $injector.get(schema);
        return _.find(schema, {name: column});
    };

    this.extractValidators = function(schemaName, columnName) {
        var schema = $injector.get(schemaName);
        var column = this.extractColumn(schemaName, columnName);

        return _.chain(schema)
                    .where({name: columnName})
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
        var controller = element.closestAttribute('df-controller');
        var model = element.closestAttribute('df-model-instance');
        element.append(_.template(value)({model: model, controller: controller}));
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
angular.module('dynamicForms').directive('dfModel', function($injector, $templateCache, DfUtils) {
    function resolveType (type) {
        switch(type) {
            case 'radio':
                return '/radio.html';
            case 'inputgroup':
                return '/inputgroup.html';
            case 'checkbox':
                return '/checkbox.html';
            default:
                return '/input.html';
        }
    }

    function getTemplateDirectory(tAttrs) {
        if (tAttrs.dfTemplate) {
            return tAttrs.dfTemplate;
        }
        var sessionService = $injector.has('DfSessionService') ? $injector.get('DfSessionService') : null;
        return sessionService && $injector.get(sessionService).isLoggedIn() ? 'myaccount' : 'npw';
    }

    return {
        restrict: 'EA',
        priority: 1100,
        compile: function(tElement, tAttrs) {
            var schema = DfUtils.getDependency(tAttrs.dfSchema),
                controller = tAttrs.dfController,
                model = tAttrs.dfModelInstance,
                mode = tAttrs.dfMode,
                form = tAttrs.ngForm;

            _.each(schema, function(column) {
                var props = {controller: controller, column: column, form: form, mode: mode, model: model};

                var template = $templateCache.get(column.template) || $templateCache.get('templates/' + getTemplateDirectory(tAttrs) + resolveType(column.type));

                props.show = column.show ? _.template(column.show)(props) : true;

                tElement.append( _.template(template)(props) );
            });
        }
    }
});
/**
 * This controller manages the column's (input field) state.
 * Specifically between the read and edit states.
 */
angular.module('dynamicForms').controller('DfColumnController', ['$scope', '$element', '$rootScope', 'DfUtils', function ($scope, $element, $rootScope, DfUtils) {
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
        $rootScope.$broadcast('df_input_focus', model.input.attr('id'));
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

    $rootScope.$on('df_input_focus', function(val) {
        model.help = val === model.input.attr('id');
    });
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
angular.module("dynamicForms").run(["$templateCache", function($templateCache) {$templateCache.put("templates/custom/pay-radios.html","<div ng-repeat=\"card in payCtrl.storedCards\">\r\n    <label for=\"card{{$index}}\">\r\n        <input type=\"radio\" class=\"sy-radio\" name=\"cardIndex\" ng-model=\"payCtrl.model.cardIndex\" id=\"card{{$index}}\" value=\"{{$index}}\" ng-value=\"{{$index}}\" />\r\n        {{card.maskedCreditCardNumber}}\r\n    </label>\r\n</div>");
$templateCache.put("templates/default/input.html","<div class=\"df-column\" df-column=\"<%= column %>\" df-mode=\"<%= mode %>\">\r\n\r\n    <label df-label class=\"df-label\"></label>\r\n\r\n    <div>\r\n        <input df-input class=\"df-input\" />\r\n        <div class=\"messages\">\r\n            <div df-edit class=\"df-edit\"></div>\r\n            <div df-help class=\"df-help\"></div>\r\n            <div df-validation class=\"df-validation\"></div>\r\n        </div>\r\n    </div>\r\n\r\n    <div df-edit-controls class=\"df-edit-controls\"></div>\r\n\r\n</div>");
$templateCache.put("templates/myaccount/input.html","<div sy-form-group data-layout=\"form\" df-column=\"<%= column.name %>\" df-mode=\"<%= mode %>\" ng-show=\"<%= show %>\">\r\n    <label class=\"control-label\" df-label ng-class=\"{\'label-required\': !optional}\"></label>\r\n    <div>\r\n        <input type=\"text\" class=\"form-control\" df-input />\r\n\r\n        <div sy-alert-box=\"<%= column.name %>\" df-validation>\r\n        </div>\r\n    </div>\r\n</div>");
$templateCache.put("templates/myaccount/radio.html","<div sy-form-group data-layout=\"form\" df-column=\"<%= column.name %>\" df-mode=\"<%= mode %>\" ng-show=\"<%= show %>\">\r\n    <label class=\"control-label\" df-label ng-class=\"{\'label-required\': !optional}\"></label>\r\n    <div>\r\n        <input type=\"text\" class=\"form-control\" df-input />\r\n\r\n        <div class=\"sy-form-error\" df-validation></div>\r\n    </div>\r\n</div>");
$templateCache.put("templates/npw/checkbox.html","<div class=\"field-group\" df-column=\"<%= column.name %>\" df-mode=\"<%= mode %>\" ng-show=\"<%= show %>\">\r\n    <input type=\"checkbox\" class=\"filter-input\" df-input>\r\n    <label class=\"filter-label\" df-label></label>\r\n</div>");
$templateCache.put("templates/npw/input.html","<div class=\"field-group\" df-column=\"<%= column.name %>\" df-mode=\"<%= mode %>\"\r\n     ng-class=\"{\'field-group-tooltip--active\': columnCtrl.displayHelp(), \'field-group--error\': <%= form %>.<%= column.name %>.$invalid && <%= form %>.<%= column.name %>.$dirty}\"\r\n     ng-show=\"<%= show %>\">\r\n\r\n    <div class=\"form-input-container\">\r\n        <label class=\"form-label\" df-label></label>\r\n        <input type=\"text\" class=\"form-input\" df-input />\r\n    </div>\r\n\r\n\r\n    <button type=\"button\" class=\"form-tooltip-toggle\" ng-click=\"columnCtrl.toggleHelp()\">\r\n        <span>Show help information</span>\r\n    </button>\r\n\r\n    <!--Help-->\r\n    <div class=\"form-tooltip form-tooltip--feature-aside\" df-help>\r\n    </div>\r\n\r\n    <!--Validation-->\r\n    <div class=\"form-error\" df-validation>\r\n    </div>\r\n</div>\r\n");
$templateCache.put("directives/model/column/components/df-edit-controls.html","<button class=\"df-cancel-edit\" ng-click=\"columnCtrl.cancelEdit()\">\r\n    Cancel\r\n</button>\r\n<button class=\"df-save-edit\" ng-click=\"columnCtrl.saveEdit()\">\r\n    Save\r\n</button>");
$templateCache.put("directives/model/column/components/df-edit.html","<button class=\"df-edit-button\" ng-click=\"columnCtrl.startEdit()\" ng-if=\"columnCtrl.isReadonly()\">\r\n    Edit\r\n</button>");}]);
angular.module('dynamicForms').directive('dfHelp', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            DfSchemaService.appendColumnValue(element, 'help');
            $compile(element.contents())(scope);
        }
    }
});
angular.module('dynamicForms').directive('dfInput', function($compile, DfSchemaService) {

    return {
        restrict: 'A',
        priority: 1050,
        require: '^dfColumn',
        compile: function(element, attrs) {
            element.removeAttr('df-input');

            // Retrieve details
            var schema = element.closestAttribute('df-schema'),
                column = element.closestAttribute('df-column'),
                model = element.closestAttribute('df-model-instance') || 'model',
                controller = element.closestAttribute('df-controller'),
                mode = element.closestAttribute( 'df-mode' ) || 'write';

            // Check if we need to swap in a select
            var columnDefinition = DfSchemaService.extractColumn(schema, column);

            // Attach validators using defaults where needed.
            var validators = DfSchemaService.extractValidators(schema, column);
            if (columnDefinition.show) {
                var optionalExpression = _.template(columnDefinition.show)({controller: controller, model: model, mode: mode});
                validators["ng-required"] = "(" + optionalExpression + ") " + " && (" +  validators["ng-required"] + ")";
            }

            _.each(validators, function(val,key) {
                element.attr(key, _.template(val)({controller: controller, model: model}));
            });

            // Bind to the model.
            element.attr( "ng-model", model + "." + column );

            return {
                pre: function(scope, iElem){
                    $compile(iElem)(scope);
                },
                post: function(scope, iElem, iAttrs, columnCtrl){
                    columnCtrl.registerInput(iElem);
                }
            }
        }
    }
});
angular.module('dynamicForms').directive('dfLabel', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        priority: 1000,
        compile: function(tElement) {
            DfSchemaService.prependColumnValue(tElement, 'label');
            var column = DfSchemaService.findColumn(tElement);
            tElement.attr('for', column)
        }
    }
});
angular.module('dynamicForms').directive('dfValidation', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        priority: 1000,
        compile: function(tElement, tAttrs) {
            DfSchemaService.appendColumnValue(tElement, 'validation');
        }
    }
});