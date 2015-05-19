'use strict';

var gulp = require('gulp');

var listing = require('gulp-task-listing'),
    nodemon = require('gulp-nodemon'),
    lint = require('gulp-eslint');

gulp.task('lint', function () {
    return gulp.src(['./**/*.js'])
        .pipe(lint())
        .pipe(lint.format());
});

gulp.task('watch', function () {
  nodemon({
    script: 'app.js',
    ext: 'js',
    env: { NODE_ENV: process.env.NODE_ENV || 'development' }
  }).on('change', ['lint'])
    .on('restart', function () {
      console.log('Restarted!');
    });
});

gulp.task('default', listing.withFilters(null, 'default'));
