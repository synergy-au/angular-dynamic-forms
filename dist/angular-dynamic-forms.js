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
angular.module('dynamicForms').directive('dfModel', function($compile, $templateCache, DfSchemaService) {
    return {
        restrict: 'EA',
        priority: 1100,
        compile: function(element, attrs) {
            var columns = DfSchemaService.extractColumns(attrs.dfSchema),
                mode = attrs.dfMode;

            var template = $templateCache.get('templates/' + (attrs.dfTemplate || 'default') + '.html');

            _.each(columns, function(it) {
                element.append( $templateCache.get(it.template) || _.template(template)({column: it.column, mode: mode}) );
            });
        }
    }
});
// TODO Contain all logic in here.
angular.module('dynamicForms').service('DfSchemaService', function (Utils, $injector) {
    var defaults =  $injector.has('dynamicFormDefaults')  ? $injector.get('dynamicFormDefaults') : function(column) {
        return {
            "ng-required": true,
            "type": "text",
            "df-edit-button": "",
            "id": column,
            "name": column
        };
    };

    this.findSchema = function(element) {
        return Utils.getDependency(element.closestAttribute('df-schema'));
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
        this.schema = $injector.get(schema);
        return _.map(this.schema, function(it){
            return { column: it.column, template: it.template };
        });
    };

    this.extractColumn = function(schema, column) {
        this.schema = $injector.get(schema);
        return _.find(this.schema, {column: column});
    };

    this.extractValidators = function(schema, column) {
        this.schema = $injector.get(schema);

        return _.chain(this.schema)
                    .where({column: column})
                    .pluck('validators')
                    .map(function(validators){
                        return _.defaults(validators || {}, defaults());
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
angular.module('dynamicForms').service('Utils', function ($injector) {
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
$templateCache.put("templates/npw.html","<div class=\"field-group\" df-column=\"<%= column %>\" df-mode=\"<%= mode %>\">\r\n\r\n    <div class=\"form-input-container\">\r\n        <label class=\"form-label\" df-label></label>\r\n        <input type=\"text\" class=\"form-input\" df-input>\r\n    </div>\r\n\r\n\r\n    <button type=\"button\" toggle-tooltip=\"\" class=\"form-tooltip-toggle\">\r\n        <span>Show help information</span>\r\n    </button>\r\n\r\n    <!--Help-->\r\n    <div class=\"form-tooltip form-tooltip--feature-aside\" df-help>\r\n    </div>\r\n    <!--Validation-->\r\n    <div class=\"form-error\" df-validation>\r\n    </div>\r\n</div>\r\n");
$templateCache.put("directives/components/df-edit-controls.html","<button class=\"df-cancel-edit\" ng-click=\"columnCtrl.cancelEdit()\">\r\n    Cancel\r\n</button>\r\n<button class=\"df-save-edit\" ng-click=\"columnCtrl.saveEdit()\">\r\n    Save\r\n</button>");
$templateCache.put("directives/components/df-edit.html","<button class=\"df-edit-button\" ng-click=\"columnCtrl.startEdit()\" ng-if=\"columnCtrl.readonly()\">\r\n    Edit\r\n</button>");}]);
angular.module('dynamicForms').directive('dfColumn', function() {
    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs, ctrl) {
            ctrl.init(element.closestAttribute( 'df-mode' ) || 'write');
        },
        controller: 'DfColumnController',
        controllerAs: 'columnCtrl'
    }
});
angular.module('dynamicForms').directive('dfEditControls', function() {
    return {
        restrict: 'A',
        require: '^dfColumn',
        templateUrl: 'directives/components/df-edit-controls.html'
    }
});
angular.module('dynamicForms').directive('dfEdit', function() {
    return {
        restrict: 'A',
        require: '^dfColumn',
        templateUrl: 'directives/components/df-edit.html'
    }
});
angular.module('dynamicForms').directive('dfHelp', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        priority: 1050,
        compile: function(element, attrs) {
            DfSchemaService.appendColumnValue(element, 'help');
        }
    }
});
angular.module('dynamicForms').directive('dfInput', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        priority: 1050,
        compile: function(element, attrs) {
            var schema = element.closestAttribute('df-schema'),
                column = element.closestAttribute('df-column'),
                instance = element.closestAttribute('df-model-instance') || 'model',
                controller = element.closestAttribute('df-controller'),
                mode = element.closestAttribute( 'df-mode' ) || 'write',
                model = element.closestAttribute('df-model-instance');

            var validators = DfSchemaService.extractValidators(schema, column),
                columnDefinition = DfSchemaService.extractColumn(schema, column);

            element.removeAttr('df-input');

            var input;
            if ((columnDefinition && columnDefinition['type']) === 'select') {
                input = angular.element('<select class="df-input"></select>');
                element.replaceWith(input);
            } else {
                input = element;
            }

            _.each(validators, function(val,key) {
                input.attr(key, _.template(val)({controller: controller, model: model}));
            });

            input.attr( "ng-model", instance + "." + column );

            return function (scope, input) {
                $compile(input)(scope);
            };
        }
    }
});
angular.module('dynamicForms').directive('dfLabel', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        priority: 1075,
        compile: function(element) {
            DfSchemaService.prependColumnValue(element, 'label');
            var column = DfSchemaService.findColumn(element);
            element.attr('for', column)
        }
    }
});
angular.module('dynamicForms').directive('dfValidation', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        priority: 1025,
        compile: function(element, attrs) {
            DfSchemaService.appendColumnValue(element, 'validation');
        }
    }
});
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
angular.module('dynamicForms').directive('dfEditButton', function() {
    return {
        restrict: 'A',
        require: '^dfColumn',
        templateUrl: 'directives/components/df-edit.html',
        link: function(scope, element, attrs, columnCtrl) {
            columnCtrl.registerInput(element);
        }
    }
});