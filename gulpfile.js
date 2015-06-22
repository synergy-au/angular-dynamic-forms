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
    var templates = gulp.src('src/**/*.html')
                    .pipe($.angularTemplatecache({module: 'dynamicForms'}));

    var app = gulp.src('src/**/*.js');

    return es.merge([app, templates])
        .pipe($.concat('angular-dynamic-forms.js'))
        .pipe(gulp.dest('dist/'))
        .pipe($.ngAnnotate()).pipe($.uglify({mangle:true}))
        .pipe($.rename('angular-dynamic-forms.min.js'))
        .pipe(gulp.dest('dist/'));
});

gulp.task('templates', function() {
    return gulp.src('js/**/*.html')
        .pipe($.angularTemplatecache({module: 'forms'}))
        .pipe(gulp.dest('target'));
});

gulp.task('css', function() {
    return gulp.src('css/**/*.css')
        .pipe(gulp.dest('target/css'));
});

gulp.task('build', ['templates', 'javascript', 'css'], function() {
    console.log("Done")
});

gulp.task ('default', function() {
    return runs(
        ['build']);
});