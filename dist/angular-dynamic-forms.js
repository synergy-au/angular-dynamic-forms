angular.module('dynamicForms', [])
angular.module("dynamicForms").run(["$templateCache", function($templateCache) {$templateCache.put("templates/column.html","<div df-column=\"<%= column %>\" sy-form-group data-layout=\"<%= layout %>\">\r\n    <label df-label>\r\n    </label>\r\n    <div>\r\n        <input class=\"df-form-input\" df-input />\r\n        <div class=\"messages\">\r\n            <div class=\"df-form-input-label\"></div>\r\n            <div df-help></div>\r\n            <div df-validation></div>\r\n        </div>\r\n    </div>\r\n</div>");}]);
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
angular.module('dynamicForms').directive('dfFormInput', function(DfSchemaService) {
    return {
        restrict: 'C',
        link: function(scope, element, attrs) {
            var mode = element.closestAttribute( 'df-mode' ) || 'write';

            if (mode === 'summary') {
                element.attr( 'disabled', true );
            }
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
            element.addClass('extra-help');

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
                model = element.closestAttribute('df-model-instance');

            var validators = DfSchemaService.extractValidators(schema, column),
                columnDefinition = DfSchemaService.extractColumn(schema, column);

            element.removeAttr('df-input');
            var input;
            if (columnDefinition['type'] == 'select') {
                input = angular.element('<select class="df-form-input"></select>');
                element.replaceWith(input)
            } else {
                input = element;
            }

            _.each(validators, function(val,key) {
                input.attr(key, _.template(val)({controller: controller, model: model}));
            });

            input.attr( 'ng-required', validators['ng-required'] || 'true');
            input.attr( 'type', columnDefinition['type'] || 'text');
            input.attr("id", column);
            input.attr("name", column);
            input.attr("ng-model", instance + "." + column);

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
                mode = attrs.mode;

            var template = $templateCache.get('templates/column.html');

            _.each(columns, function(it) {
                element.append( $templateCache.get(it.template) || _.template(template)({column: it.column, layout: mode === 'summary' ? 'form' : 'form'}) );
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
            element.addClass('validation-message');

            element.append(validation);
        }
    }
});