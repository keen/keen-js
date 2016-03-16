var gulp = require('gulp'),
    pkg = require('./package.json');

var aws = require('gulp-awspublish'),
    browserify = require('browserify'),
    connect = require('gulp-connect'),
    compress = require('gulp-yuicompressor'),
    del = require('del'),
    karma = require('karma').server,
    mocha = require('gulp-mocha'),
    mochaPhantomJS = require('gulp-mocha-phantomjs'),
    moment = require('moment'),
    rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    squash = require('gulp-remove-empty-lines'),
    strip = require('gulp-strip-comments'),
    transform = require('vinyl-transform');

// -------------------------
// Build tasks
// -------------------------

gulp.task('build', ['build:browserify', 'build:minify']);

gulp.task('build:browserify', function() {
  return gulp.src([
      './src/keen.js',
      './src/keen-tracker.js',
      './src/keen-query.js',
      './src/keen-c3.js'
    ])
    .pipe(transform(function(filename) {
      var b = browserify(filename);
      return b.bundle();
    }))
    // Clean out nested AMD defintions
    .pipe(replace('(isLoader)', '(false)'))
    .pipe(replace('define(function () {', '(function(){'))
    .pipe(replace('define(definition)', '{}'))
    .pipe(replace('define(factory)', '{}'))
    // Clean up source
    .pipe(strip({ line: true }))
    .pipe(squash())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build:minify', ['build:browserify'], function(){
  return gulp.src([
      './dist/keen.js',
      './dist/keen-tracker.js',
      './dist/keen-query.js',
      './dist/keen-c3.js'
      // './src/loader.js'
    ])
    .pipe(compress({ type: 'js' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('connect', ['build'], function () {
  return connect.server({
      root: [ __dirname, 'test', 'test/unit', 'test/vendor', 'test/examples' ],
      port: 9999
    });
});

gulp.task('watch', ['connect'], function() {
  return gulp.watch([
      'src/**/*.js',
      'gulpfile.js'
    ], ['build']);
});

gulp.task('watch-with-tests', function() {
  return gulp.watch([
      'src/**/*.js',
      'test/unit/**/*.*',
      '!test/unit/build/**/*.*',
      'gulpfile.js'
    ], ['build', 'test:mocha', 'test:phantom']);
});


// -------------------------
// Test tasks
// -------------------------

gulp.task('test:clean', function (callback) {
  del(['./test/unit/build'], callback);
});

gulp.task('test:build', ['test:clean'], function () {
  return gulp.src('./test/unit/index.js')
    .pipe(transform(function(filename) {
      var b = browserify(filename);
      return b.bundle();
    }))
    .pipe(rename('browserified-tests.js'))
    .pipe(gulp.dest('./test/unit/build'));
});

gulp.task('test-with-mocha', ['test:prepare'], function () {
  return gulp.src('./test/unit/server.js', { read: false })
  .pipe(mocha({ reporter: 'nyan' }));
});

gulp.task('test-with-phantom', ['build', 'test:prepare'], function () {
  return gulp.src('./test/unit/index.html')
    .pipe(mochaPhantomJS());
});

gulp.task('test-with-karma', ['build', 'test:prepare'], function (done){
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('test-with-sauce', ['build', 'test:prepare'], function(){
  karma.start({
    browsers: Object.keys(getCustomLaunchers()),
    browserDisconnectTimeout: 10 * 1000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 20 * 1000,
    captureTimeout: 300 * 1000,
    configFile : __dirname + '/karma.conf.js',
    customLaunchers: getCustomLaunchers(),
    logColors: true,
    reporters: [ 'saucelabs' ],
    sauceLabs: {
      testName: pkg.name + moment().format(': ddd, MMM Do, h:mm:ss a'),
      recordScreenshots: false,
      recordVideo: false
    },
    singleRun  : true,
    action     : 'run'
  });
});


// -------------------------
// Test bundles
// -------------------------

gulp.task('test:prepare', ['test:clean', 'test:build']);

gulp.task('test:mocha', ['test:prepare', 'test-with-mocha']);
gulp.task('test:phantom', ['build', 'test:prepare', 'test-with-phantom']);
gulp.task('test:karma', ['build', 'test:prepare', 'test-with-karma']);
gulp.task('test:local', ['test:prepare', 'test-with-mocha', 'test-with-phantom', 'test-with-karma']);

gulp.task('test:sauce', ['build', 'test:prepare', 'test-with-sauce']);
gulp.task('test:cli', ['test:prepare', 'test-with-mocha', 'test-with-phantom']);
gulp.task('test:all', ['test:prepare', 'test-with-mocha', 'test-with-phantom', 'test-with-karma', 'test-with-sauce']);


// -------------------------
// Deployment task
// -------------------------

gulp.task('deploy', ['build', 'test:local', 'aws']);

gulp.task('aws', ['build', 'test:local'], function() {

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

  return gulp.src([
      './dist/keen.js',
      './dist/keen.min.js',
      './dist/keen-tracker.js',
      './dist/keen-tracker.min.js',
      './dist/keen-query.js',
      './dist/keen-c3.min.js',
      './dist/keen-c3.js'
    ])
    .pipe(rename(function(path) {
      path.dirname += '/' + pkg['version'];
    }))
    .pipe(aws.gzip())
    .pipe(publisher.publish(headers, { force: true }))
    .pipe(publisher.cache())
    .pipe(aws.reporter());

});


// -------------------------
// Bundled tasks
// -------------------------

gulp.task('default', ['test:prepare', 'build', 'connect', 'watch']);

gulp.task('with-tests', ['test:local', 'build', 'connect', 'watch-with-tests']);


function getCustomLaunchers(){
  return {
    sl_ios: {
      base: 'SauceLabs',
      browserName: 'iPhone',
      platform: 'OS X 10.9',
      version: '8.1'
    },
    sl_android: {
      base: 'SauceLabs',
      browserName: 'android',
      platform: 'Linux',
      version: '4.4'
    },

    sl_ie_11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11'
    },
    sl_ie_10: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8',
      version: '10'
    }
    // sl_ie_9: {
    //   base: 'SauceLabs',
    //   browserName: 'internet explorer',
    //   platform: 'Windows 7',
    //   version: '9'
    // }
  };
}
