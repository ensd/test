const gulp = require('gulp');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const watch = require('gulp-watch');
const del = require('del');

const series = ['clean', 'html', 'images', 'css.vendor', 'sass', 'js.vendor', 'js.main', 'js.db'];

gulp.task('images', () => {
  return gulp.src(['src/_images/**'])
    .pipe(gulp.dest('build/images'));
});

gulp.task('sass', () => {
  return gulp.src(['src/_styles/**/*.{sass,scss}'])
    .pipe(sourcemaps.init())
    .pipe(sass({
      errorLogToConsole: true,
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(concat("main.css"))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('build/css/'));
});

gulp.task('css.vendor', function() {
  return gulp.src([
      'node_modules/bootstrap/dist/css/bootstrap.min.css',
      'node_modules/lightbox2/dist/css/lightbox.min.css'
    ])
    .pipe(sourcemaps.init())
    .pipe(concat("vendor.css"))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest("build/css"));
});

gulp.task('js.vendor', function() {
  return gulp.src([
      'node_modules/jquery/dist/jquery.min.js', 
      'node_modules/popper.js/dist/umd/popper.min.js', 
      'node_modules/bootstrap/dist/js/bootstrap.min.js',
      'node_modules/lightbox2/dist/js/lightbox.min.js',
      'node_modules/moment/min/moment-with-locales.min.js'
    ])
    .pipe(concat("vendor.js"))
    .pipe(gulp.dest("build/js"));
});

gulp.task('js.main', function() {
  return gulp.src(['src/_scripts/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(concat("main.js"))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest("build/js"));
});

gulp.task('js.db', function() {
  return gulp.src(['src/_db/**/*.json'])
    .pipe(gulp.dest("build/db"));
});

gulp.task('html', function() {
  return gulp.src(['src/**/*.html'])
    .pipe(gulp.dest("build/"));
});

gulp.task('clean', () => {
  return del([
    'build'
  ]);
});

gulp.task('watch', () => {
  gulp.watch(['src/**/*.{html,js,scss}'], gulp.series(series));
});

gulp.task('default', gulp.series(series));