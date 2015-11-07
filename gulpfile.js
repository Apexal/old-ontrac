var gulp = require('gulp');

// PLUGINS
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var autoprefix = require('gulp-autoprefixer');
var minifyCSS = require('gulp-minify-css');

var bowerPath = "vendor";
var jsPath = "client/js";

var files = {
  js: [bowerPath+'/jquery/dist/jquery.min.js', bowerPath+'/jquery-ui/jquery-ui.min.js',
    bowerPath+'/moment/moment.js', bowerPath+'/bootstrap/dist/js/bootstrap.min.js',
    'client/lib/js/*.js', jsPath+'/**/*.js', jsPath+'/*.js'],
  css: [bowerPath+'/bootstrap/dist/css/bootstrap.min.css', bowerPath+'/bootstrap/dist/css/cosmo-theme.min.css',
    bowerPath+'/fontawesome/css/font-awesome.min.css', 'client/lib/css/*.css', 'client/css/*.css']
}

// JS concat, strip debugging and minify
gulp.task('scripts', function() {
  return gulp.src(files.js)
    .pipe(concat('script.js'))
    //.pipe(stripDebug())
    .pipe(uglify())
    .pipe(gulp.dest('client/public/'));
});

gulp.task('fonts', function() {
  return gulp.src([bowerPath+'/fontawesome/fonts/*', bowerPath+'/bootstrap/dist/fonts/*'])
    .pipe(gulp.dest('client/public/fonts'));
});

// JS hint task
gulp.task('jshint', function() {
  return gulp.src([jsPath+'/*.js', '!'+jsPath+'/jquery.knob.js', '!'+jsPath+'/pnotify.custom.min.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// CSS concat, auto-prefix and minify
gulp.task('styles', function() {
  return gulp.src(files.css)
    .pipe(concat('style.css'))
    .pipe(autoprefix('last 2 versions'))
    .pipe(minifyCSS())
    .pipe(gulp.dest('client/public/'));
});

gulp.task('pre', ['scripts', 'styles', 'fonts']);

gulp.task('default', ['jshint', 'scripts', 'styles', 'fonts'], function() {
  // watch for JS changes
  gulp.watch([jsPath+'/**/*.js', jsPath+'/*.js'], ['jshint', 'scripts']);

  // watch for CSS changes
  gulp.watch('./client/css/*.css', ['styles']);
});
