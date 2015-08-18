var gulp = require('gulp');

// PLUGINS
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var autoprefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');

gulp.task('jshint', function() {
  return gulp.src(['./public/javascripts/*.js', '!./public/javascripts/jquery.knob.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// JS concat, strip debugging and minify

gulp.task('scripts', function() {
  return gulp.src(['./public/javascripts/modals.js', './public/javascripts/effects.js', './public/javascripts/sockets.js', './public/javascripts/lib.js'])
    .pipe(concat('script.js'))
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(gulp.dest('./public/build/js/'));
});



// CSS concat, auto-prefix and minify
gulp.task('styles', function() {
  return gulp.src(['./public/css/*.css'])
    .pipe(concat('styles.css'))
    .pipe(autoprefix('last 2 versions'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./public/build/css/'));
});

gulp.task('default', ['scripts', 'styles'], function() {
  // watch for JS changes
  gulp.watch('./public/javascripts/*.js', ['jshint', 'scripts']);

  // watch for CSS changes
  gulp.watch('./public/css/*.css', ['styles']);
});
