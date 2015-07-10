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