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