var gulp = require('gulp');
var sass = require('gulp-sass');
var connect = require('gulp-connect');
var gutil = require('gulp-util');
var babel = require('gulp-babel');

gulp.task('sass', function() {
  return gulp.src('./public/scss/styles.scss')
  .pipe(sass())
    .pipe(gulp.dest('./public/css'))
});

// gulp.task('babel', function() {
//   return gulp.src('./',)
//   .pipe(babel({
//     presets: ['@babel/env']
//   }))
//   .pipe(gulp.dest('dist'))
// });

gulp.task('watch', function() {
  gulp.watch('./public/scss/*.scss', ['sass'])
  //gulp.watch('./js/*.js', ['js'])
});

gulp.task('default', ['sass', 'babel', 'watch']);
