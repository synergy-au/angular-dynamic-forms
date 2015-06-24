module.exports = function (gulp, plugins) {
    return function () {
        gulp.src('css/**/*.css')
        .pipe(plugins.concat('angular-dynamic-forms.css'))
        .pipe(gulp.dest('dist'))
        .pipe(plugins.minifyCss())
        .pipe(plugins.rename('angular-dynamic-forms.min.css'))
        .pipe(gulp.dest('dist'));
    };
};