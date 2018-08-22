var gulp = require('gulp');
var sass = require('gulp-sass');
var connect = require('gulp-connect');
var gutil = require('gulp-util');

gulp.task('sass', function() {
  return gulp.src('./public/scss/styles.scss')
  .pipe(sass())
    .pipe(gulp.dest('./public/css'))
});

gulp.task('watch', function() {
  gulp.watch('./public/scss/*.scss', ['sass'])
  //gulp.watch('./js/*.js', ['js'])
});

gulp.task('default', ['sass', 'watch']);
