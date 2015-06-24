var gulp		= require('gulp'),
    del         = require('del'),
    browserSync = require('browser-sync'),
    runs        = require('run-sequence'),
    $           = require('gulp-load-plugins')({lazy: false});

gulp.task('clean', function() {
    del(['dist/**/*'], {force: true}, function (err, paths) {
        console.log('Deleted files/folders:\n', paths.join('\n'));
    });
});

gulp.task('scripts', require('./gulp-tasks/scripts')(gulp, $));
gulp.task('styles', require('./gulp-tasks/styles')(gulp, $));

gulp.task('build', ['styles', 'scripts'], function() {
    console.log("Done")
});

gulp.task ('default', function() {
    return runs('clean', 'build');
});

gulp.task('style-watch', ['styles'], browserSync.reload);
gulp.task('script-watch', ['scripts'], browserSync.reload);

gulp.task('develop', ['build'], function() {

    browserSync.init({
        server: {
            baseDir: 'demo',
            routes: {
                "/dist": "dist",
                "/lib": "bower_components"
            }
        }

    });

    gulp.watch("css/**/*.css", ['style-watch']);
    gulp.watch(["js/**/*.js", "js/**/*.html"], ['script-watch']);
});