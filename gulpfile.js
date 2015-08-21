var gulp = require('gulp');

// PLUGINS
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var autoprefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');

var bowerPath = "./vendor";
var jsPath = "./assets/js";

var files = {
  js: [bowerPath+'/jquery/dist/jquery.min.js', bowerPath+'/jquery-ui/jquery-ui.min.js',
    bowerPath+'/moment/moment.js', bowerPath+'/bootstrap/dist/js/bootstrap.min.js',
    jsPath+'/*.js'],
  css: [bowerPath+'/bootstrap/dist/css/bootstrap.min.css',
    bowerPath+'/fontawesome/css/font-awesome.min.css', './assets/css/*.css']
}

// JS concat, strip debugging and minify
gulp.task('scripts', function() {
  return gulp.src(files.js)
    .pipe(concat('script.js'))
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(gulp.dest('./public/js/'));
});


// JS hint task
gulp.task('jshint', function() {
  gulp.src(['./assets/js/*.js', '!./assets/js/jquery.knob.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// CSS concat, auto-prefix and minify
gulp.task('styles', function() {
  return gulp.src(files.css)
    .pipe(concat('styles.css'))
    .pipe(autoprefix('last 2 versions'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./public/css/'));
});

gulp.task('default', ['jshint', 'scripts', 'styles'], function() {
  // watch for JS changes
  gulp.watch('./assets/js/*.js', ['jshint', 'scripts']);

  // watch for CSS changes
  gulp.watch('./assets/css/*.css', ['styles']);
});
