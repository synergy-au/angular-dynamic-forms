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