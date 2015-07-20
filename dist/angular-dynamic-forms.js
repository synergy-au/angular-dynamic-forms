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
            "name": column.name,
            "placeholder": column.placeholder || column.name
        };
    };

    this.findSchema = function(element) {
        return DfUtils.getDependency(element.closestAttribute('df-schema'));
    };
    this.findColumn = function(element) {
        return element.attr('df-column') || element.closestAttribute('df-column');
    };

    this.getSchemaProps = function(tAttrs) {
        return {
            schema: tAttrs.dfSchema,
            controller: tAttrs.dfController,
            model: tAttrs.dfModelInstance,
            mode: tAttrs.dfMode,
            form: tAttrs.ngForm,
            formStyle: tAttrs.dfFormStyle || "{}"
        };
    };

    this.getInputProps = function(element) {
        var inputProps = {
            schema: element.closestAttribute('df-schema'),
            column: element.closestAttribute('df-column'),
            model: element.closestAttribute('df-model-instance') || 'model',
            controller: element.closestAttribute('df-controller'),
            mode: element.closestAttribute( 'df-mode' ) || 'write'
        };
        inputProps.columnDetails = this.extractColumn(inputProps.schema, inputProps.column);
        inputProps.validators = this.extractValidators(inputProps.schema, inputProps.column);
        return inputProps;
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
    this.getColumnValue = function(element, key) {
        var value = this.extractValue(element, key);
        var controller = element.closestAttribute('df-controller');
        var model = element.closestAttribute('df-model-instance');
        return _.template(value)({model: model, controller: controller});
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
angular.module('dynamicForms').directive('dfModel', function($injector, $templateCache, DfUtils, DfSchemaService) {
    function resolveType (column) {
        var type = column.customType || column.type;
        switch(type) {
            case 'radio':
                return '/radio.html';
            case 'inputgroup':
                return '/inputgroup.html';
            case 'terms':
                return '/terms.html';
            case 'checkbox':
                return '/checkbox.html';
            default:
                return '/input.html';
        }
    }

    function getTemplateDirectory(tAttrs) {
        if (tAttrs.dfTemplate) {
            return tAttrs.dfTemplxate;
        }
        var sessionService = $injector.has('DfSessionService') ? $injector.get('DfSessionService') : null;
        return sessionService && $injector.get(sessionService).isLoggedIn() ? 'myaccount' : 'npw';
    }

    return {
        restrict: 'EA',
        priority: 1100,
        compile: function(tElement, tAttrs) {
            var props = DfSchemaService.getSchemaProps(tAttrs)
            var schema = DfUtils.getDependency(props.schema);
            var templateDir = getTemplateDirectory(tAttrs);

            var wrapper = _.template($templateCache.get('templates/' + templateDir + '/wrapper.html'))(props);
            var wrapperElement = angular.element(wrapper);

            tElement.prepend(wrapperElement);

            _.each(schema, function(column) {
                props.column = column;

                var template = $templateCache.get(column.template) || $templateCache.get('templates/' + templateDir + resolveType(column));

                props.show = column.show ? _.template(column.show)(props) : true;

                wrapperElement.find('mainform').append( _.template(template)(props) );
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
        templateUrl: 'directives/model/column/components/df-edit-controls.html`'
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
            var helpImage = DfSchemaService.getColumnValue(element, 'helpImage');
            var help = DfSchemaService.getColumnValue(element, 'help');

            if (helpImage) {
                element.find('img').attr('src', helpImage)
            } else {
                element.find('img').remove();
            }

            if (help) {
                element.find('div p').append(help);
            }

            $compile(element.contents())(scope);
        }
    }
});
angular.module('dynamicForms').directive('dfInput', function($compile, DfSchemaService) {

    return {
        restrict: 'A',
        priority: 1050,
        require: '^dfColumn',
        compile: function(tElement, attrs) {
            tElement.removeAttr('df-input');

            // Retrieve details
            var props = DfSchemaService.getInputProps(tElement);

            if (props.columnDetails.show) {
                var optionalExpression = _.template(props.columnDetails.show)(props);
                props.validators["ng-required"] = "(" + optionalExpression + ") " + " && (" +  props.validators["ng-required"] + ")";
            }

            _.each(props.validators, function(val,key) {
                tElement.attr(key, _.template(val)(props));
            });

            // Bind to the model.
            tElement.attr( "ng-model", props.model + "." + props.column );

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
angular.module("dynamicForms").run(["$templateCache", function($templateCache) {$templateCache.put("templates/default/input.html","<div class=\"df-column\" df-column=\"<%= column %>\" df-mode=\"<%= mode %>\">\r\n\r\n    <label df-label class=\"df-label\"></label>\r\n\r\n    <div>\r\n        <input df-input class=\"df-input\" />\r\n        <div class=\"messages\">\r\n            <div df-edit class=\"df-edit\"></div>\r\n            <div df-help class=\"df-help\"></div>\r\n            <div df-validation class=\"df-validation\"></div>\r\n        </div>\r\n    </div>\r\n\r\n    <div df-edit-controls class=\"df-edit-controls\"></div>\r\n\r\n</div>");
$templateCache.put("templates/myaccount/input.html","<div sy-form-group data-layout=\"df-form-<%= mode %>\" df-column=\"<%= column.name %>\" df-mode=\"<%= mode %>\" ng-show=\"<%= show %>\">\r\n    <label class=\"control-label\" df-label ng-class=\"{\'label-required\': !optional && \'<%= mode %>\' !== \'read\'}\"></label>\r\n    <div>\r\n        <input type=\"text\" class=\"form-control\" df-input />\r\n\r\n        <div sy-alert-box=\"<%= column.name %>\" df-validation>\r\n        </div>\r\n\r\n        <div sy-help></div>\r\n    </div>\r\n</div>");
$templateCache.put("templates/myaccount/radio.html","<div sy-form-group data-layout=\"form\" df-column=\"<%= column.name %>\" df-mode=\"<%= mode %>\" ng-show=\"<%= show %>\">\r\n    <label class=\"control-label\" df-label ng-class=\"{\'label-required\': !optional}\"></label>\r\n    <div>\r\n        <input type=\"text\" class=\"form-control\" df-input />\r\n\r\n        <div class=\"sy-form-error\" df-validation></div>\r\n    </div>\r\n</div>");
$templateCache.put("templates/myaccount/terms.html","<div df-column=\"<%= column.name %>\" df-mode=\"<%= mode %>\" ng-show=\"<%= show %>\" class=\"sy-form-group--terms-checkbox\">\r\n    <label class=\"checkbox\">\r\n        I have read, understand and agree with the <a sy-doc-href=\"terms.synergy\">Terms and Conditions</a>, <a sy-doc-href=\"terms.privacy\">Privacy Policy</a> and <a sy-doc-href=\"terms.collections\">Collection of Information Statement</a> and I am authorised to enter into these Terms and Conditions.\r\n        <input type=\"checkbox\" class=\"sy-checkbox\" df-input>\r\n    </label>\r\n</div>");
$templateCache.put("templates/myaccount/wrapper.html","<div>\r\n    <mainform></mainform>\r\n</div>");
$templateCache.put("templates/npw/checkbox.html","<div class=\"field-group\" df-column=\"<%= column.name %>\" df-mode=\"<%= mode %>\" ng-show=\"<%= show %>\">\r\n    <input type=\"checkbox\" class=\"filter-input\" df-input>\r\n    <label class=\"filter-label\" df-label></label>\r\n</div>");
$templateCache.put("templates/npw/input.html","<span ng-class=\"{\'sy-field-wrapper\': <%= show %>, \'payment-status-meta-group\': \'<%= mode %>\' === \'read\', \'payment-status-meta-group--active\': columnCtrl.inEdit()}\" df-column=\"<%= column.name %>\" df-mode=\"<%= mode %>\" ng-show=\"<%= show %>\">\r\n\r\n    <dt class=\"payment-status-meta-label\" ng-show=\"\'<%= mode %>\' === \'read\'\"><span df-label></span></dt>\r\n\r\n    <dd ng-class=\"{\'payment-status-meta-data\': \'<%= mode %>\' === \'read\'}\">\r\n\r\n        <div class=\"field-group\"\r\n             ng-class=\"{\'field-group-tooltip--active\': columnCtrl.displayHelp(), \'field-group--error\': <%= form %>.<%= column.name %>.$invalid && <%= form %>.<%= column.name %>.$dirty && <%= form %>.<%= column.name %>.hasVisited}\">\r\n\r\n            <div class=\"form-input-container\">\r\n                <label class=\"form-label\" df-label></label>\r\n                <input type=\"text\" class=\"form-input\" df-input />\r\n            </div>\r\n\r\n\r\n            <button type=\"button\" class=\"form-tooltip-toggle\" ng-click=\"columnCtrl.toggleHelp()\">\r\n                <span>Show help information</span>\r\n            </button>\r\n\r\n            <!--Help-->\r\n            <div class=\"form-tooltip\" df-help ng-class=\"{\'tooltip--image-with-caption\': \'<%= column.helpImage %>\'}\">\r\n                <img src=\"\" class=\"tooltip-image\" alt=\"\"/>\r\n                <div class=\"tooltip-description\">\r\n                    <p></p>\r\n                </div>\r\n            </div>\r\n\r\n            <!--Validation-->\r\n            <div class=\"form-error\" df-validation>\r\n            </div>\r\n        </div>\r\n\r\n    </dd>\r\n\r\n    <dd class=\"payment-status-meta-edit\" ng-show=\"\'<%= mode %>\' === \'read\'\">\r\n        <button type=\"button\" class=\"btn btn--cancel\" ng-click=\"columnCtrl.cancelEdit()\">Cancel</button>\r\n        <button type=\"button\" class=\"btn btn--save\" ng-click=\"columnCtrl.saveEdit()\">Save</button>\r\n        <button type=\"button\" class=\"btn btn--edit\" ng-hide=\"<%= column.noEdit %>\" ng-click=\"columnCtrl.startEdit()\">Edit</button>\r\n    </dd>\r\n\r\n</span>");
$templateCache.put("templates/npw/terms.html","<div class=\"field-group field-group field-group--checkbox\"\r\n     ng-class=\"{\'field-group-tooltip--active\': columnCtrl.displayHelp(), \'field-group--error\': <%= form %>.<%= column.name %>.$invalid && <%= form %>.<%= column.name %>.$dirty}\"\r\n     df-column=\"<%= column.name %>\" df-mode=\"<%= mode %>\" ng-show=\"<%= show %>\">\r\n\r\n    <div class=\"form-input-container\">\r\n        <input type=\"checkbox\" class=\"form-input\" df-input />\r\n        <label class=\"form-label\" for=\"<%= column.name %>\">\r\n            I have read, understand and agree with the <a sy-doc-href=\"terms.synergy\">Terms and Conditions</a>, <a sy-doc-href=\"terms.privacy\">Privacy Policy</a> and <a sy-doc-href=\"terms.collections\">Collection of Information Statement</a> and I am authorised to enter into these Terms and Conditions.\r\n        </label>\r\n    </div>\r\n</div>");
$templateCache.put("templates/npw/wrapper.html","<div ng-class=\"{\'payment-status-container payment-status-container--review\': \'<%= mode %>\' === \'read\'}\">\r\n    <fieldset class=\"form-section\" ng-init=\"formStyle=<%= formStyle %>\" ng-style=\"formStyle\">\r\n        <dl ng-class=\"{\'payment-status-meta payment-status-meta--review\': \'<%= mode %>\' === \'read\'}\">\r\n            <mainform>\r\n\r\n            </mainform>\r\n        </dl>\r\n    </fieldset>\r\n</div>");
$templateCache.put("directives/model/column/components/df-edit-controls.html","<button class=\"df-cancel-edit\" ng-click=\"columnCtrl.cancelEdit()\">\r\n    Cancel\r\n</button>\r\n<button class=\"df-save-edit\" ng-click=\"columnCtrl.saveEdit()\">\r\n    Save\r\n</button>");
$templateCache.put("directives/model/column/components/df-edit.html","<button class=\"df-edit-button\" ng-click=\"columnCtrl.startEdit()\" ng-if=\"columnCtrl.isReadonly()\">\r\n    Edit\r\n</button>");}]);
angular.module('dynamicForms').directive('dfValidation', function($compile, DfSchemaService) {
    return {
        restrict: 'A',
        priority: 1000,
        compile: function(tElement, tAttrs) {
            DfSchemaService.appendColumnValue(tElement, 'validation');
        }
    }
});