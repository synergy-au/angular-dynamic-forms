var gulp		= require('gulp'),
    del         = require('del'),
    es		    = require('event-stream'),
    runs        = require('run-sequence'),
    $           = require('gulp-load-plugins')({lazy: false});

gulp.task('clean', function() {
    del(['dist/**/*'], {force: true}, function (err, paths) {
        console.log('Deleted files/folders:\n', paths.join('\n'));
    });
});

gulp.task('javascript', function() {
    var templates = gulp.src('js/**/*.html')
                    .pipe($.angularTemplatecache({module: 'dynamicForms'}));

    var app = gulp.src('js/**/*.js');

    return es.merge([app, templates])
        .pipe($.concat('angular-dynamic-forms.js'))
        .pipe(gulp.dest('dist'))
        .pipe($.ngAnnotate()).pipe($.uglify({mangle:true}))
        .pipe($.rename('angular-dynamic-forms.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('css', function() {
    return gulp.src('css/**/*.css')
        .pipe(gulp.dest('dist'))
        .pipe($.minifyCss())
        .pipe($.rename('angular-dynamic-forms.min.css'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', ['css', 'javascript'], function() {
    console.log("Done")
});

gulp.task ('default', function() {
    return runs('clean', 'build');
});