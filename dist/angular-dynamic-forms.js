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
angular.module("dynamicForms").run(["$templateCache", function($templateCache) {$templateCache.put("templates/column.html","<div df-column=\"<%= column %>\" df-form-group df-mode=\"<%= mode %>\">\r\n    <label df-label class=\"df-label\">\r\n    </label>\r\n    <div>\r\n        <input class=\"df-input\" df-input />\r\n        <div class=\"messages\">\r\n            <div class=\"df-form-input-label\"></div>\r\n            <div df-help class=\"df-help\"></div>\r\n            <div df-validation class=\"df-validation\"></div>\r\n        </div>\r\n    </div>\r\n</div>");}]);
angular.module('dynamicForms').directive('dfColumn', function(Utils) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var mode = element.closestAttribute( 'df-mode' ) || 'write';

            element.addClass("df-column " + Utils.classFor(mode));

        }
    }
});
angular.module('dynamicForms').directive('dfHelp', function($compile, DfSchemaService) {
    return {
        restrict: 'EA',
        priority: 1050,
        compile: function(element, attrs) {
            var schema = element.closestAttribute('df-schema'),
                column = element.closestAttribute('df-column');
            var help = DfSchemaService.extractHelp(schema, column);

            element.removeAttr('df-help');
            element.addClass('df-help');

            element.append(help);
        }
    }
});
angular.module('dynamicForms').directive('dfInput', function($compile, DfSchemaService) {
    return {
        restrict: 'EA',
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
            if ((columnDefinition && columnDefinition['type']) == 'select') {
                input = angular.element('<select class="df-input"></select>');
                element.replaceWith(input)
            } else {
                input = element;
            }

            _.each(validators, function(val,key) {
                input.attr(key, _.template(val)({controller: controller, model: model}));
            });

            input.attr( 'ng-required', (validators && validators['ng-required']) || 'true');
            input.attr( 'type', (columnDefinition && columnDefinition['type']) || 'text');
            input.attr("id", column);
            input.attr("name", column);
            input.attr("ng-model", instance + "." + column);
            input.attr("disabled", mode === 'summary');

            return function (scope, input) {
                $compile(input)(scope);
            };
        }
    }
});
angular.module('dynamicForms').directive('dfLabel', function($compile, DfSchemaService) {
    return {
        restrict: 'EA',
        priority: 1075,
        compile: function(element, attrs) {
            var schema = element.closestAttribute('df-schema'),
                column = element.closestAttribute('df-column');
            var label = DfSchemaService.extractLabel(schema, column);

            element.removeAttr('df-label');
            element.attr('for', column);

            element.prepend(label);
        }
    }
});
angular.module('dynamicForms').directive('dfModel', function($compile, $templateCache, DfSchemaService) {
    return {
        restrict: 'EA',
        priority: 1100,
        compile: function(element, attrs) {
            element.removeAttr('df-model');

            var columns = DfSchemaService.extractColumns(attrs.dfSchema),
                mode = attrs.dfMode;

            var template = $templateCache.get('templates/column.html');

            _.each(columns, function(it) {
                element.append( $templateCache.get(it.template) || _.template(template)({column: it.column, mode: mode}) );
            });
        }
    }
});
angular.module('dynamicForms').directive('dfValidation', function($compile, DfSchemaService) {
    return {
        restrict: 'EA',
        priority: 1025,
        compile: function(element, attrs) {
            var schema = element.closestAttribute('df-schema'),
                column = element.closestAttribute('df-column');
            var validation = DfSchemaService.extractValidation(schema, column);

            element.removeAttr('df-validation');
            element.addClass('df-validation');

            element.append(validation);
        }
    }
});
// TODO Contain all logic in here.
angular.module('dynamicForms').service('DfSchemaService', function ($injector) {
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
        return _.chain(this.schema).where({column: column}).pluck('validators').value().pop();
    };

    this.extractValidation = function(schema, column) {
        this.schema = $injector.get(schema);
        return _.chain(this.schema).where({column: column}).pluck('validation').value().pop();
    };

    this.extractLabel = function(schema, column) {
        this.schema = $injector.get(schema);
        return _.chain(this.schema).where({column: column}).pluck('label').value().pop();
    };

    this.extractHelp = function(schema, column) {
        this.schema = $injector.get(schema);
        return _.chain(this.schema).where({column: column}).pluck('help').value().pop();
    };
});
// TODO Contain all logic in here.
angular.module('dynamicForms').service('Utils', function () {
    var classes = {
        forMode: {
            write: 'df-column-write',
            read: 'df-column-read',
            edit: 'df-column-edit'
        }
    };

    this.classFor = function (mode) {
        return classes.forMode[mode];
    };
});