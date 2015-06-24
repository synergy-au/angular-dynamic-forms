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

    this.classesFor = function (stateFrom, stateTo) {
        return _([stateFrom, stateTo]).map(function(state) {
            return classes.forMode[state];
        }).unique().value().join(' ');
    };
});