var gulp = require('gulp'),
    pkg = require('./package.json');

var aws = require('gulp-awspublish'),
    rename = require('gulp-rename');

// -------------------------
// Deployment task
// -------------------------

gulp.task('deploy', function() {

  if (!process.env.AWS_KEY || !process.env.AWS_SECRET) {
    throw 'AWS credentials are required!';
  }

  var publisher = aws.create({
    key: process.env.AWS_KEY,
    secret: process.env.AWS_SECRET,
    bucket: pkg.name
  });

  var cacheLife = (1000 * 60 * 60 * 24 * 365); // 1 year

  var headers = {
    // Cache policy (1000 * 60 * 60 * 1) // 1 hour
    // 'Cache-Control': 'max-age=3600000, public',
    // 'Expires': new Date(Date.now() + 3600000).toUTCString()
    'Cache-Control': 'max-age=' + cacheLife + ', public',
    'Expires': new Date(Date.now() + cacheLife).toUTCString()
  };

  var jsHeaders = Object.assign({}, headers, {
    'Content-Type': 'application/javascript;charset=UTF-8'
  });

  var cssHeaders = Object.assign({}, headers, {
    'Content-Type': 'text/css'
  });

  gulp.src([
      './dist/keen.bundle.js',
      './dist/keen.bundle.min.js'
    ])
    .pipe(rename(function(path) {
      path.dirname += '/' + pkg['version'];
    }))
    .pipe(aws.gzip())
    .pipe(publisher.publish(jsHeaders, { force: true }))
    .pipe(publisher.cache())
    .pipe(aws.reporter());

  return gulp.src([
      './dist/keen.css',
      './dist/keen.min.css'
    ])
    .pipe(rename(function(path) {
      path.dirname += '/' + pkg['version'];
    }))
    .pipe(aws.gzip())
    .pipe(publisher.publish(cssHeaders, { force: true }))
    .pipe(publisher.cache())
    .pipe(aws.reporter());

});
