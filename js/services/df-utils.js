angular.module('dynamicForms').service('DfUtils', ['$injector', function ($injector) {
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
}]);