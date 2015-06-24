module.exports = function (gulp, plugins) {
    var es		    = require('event-stream');

    var templates = gulp.src('js/**/*.html')
        .pipe(plugins.angularTemplatecache({module: 'dynamicForms'}));

    var app = gulp.src('js/**/*.js');

    return function () {
        es.merge([app, templates])
            .pipe(plugins.concat('angular-dynamic-forms.js'))
            .pipe(gulp.dest('dist'))
            .pipe(plugins.ngAnnotate()).pipe(plugins.uglify({mangle:true}))
            .pipe(plugins.rename('angular-dynamic-forms.min.js'))
            .pipe(gulp.dest('dist'));
    };
};