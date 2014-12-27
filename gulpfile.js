var gulp = require("gulp"),
    pkg = require("./package.json");

var aws = require("gulp-awspublish"),
    browserify = require("browserify"),
    connect = require("gulp-connect"),
    compress = require("gulp-yuicompressor"),
    del = require("del"),
    karma = require("karma").server,
    mocha = require("gulp-mocha"),
    mochaPhantomJS = require("gulp-mocha-phantomjs"),
    moment = require("moment"),
    rename = require("gulp-rename"),
    runSequence = require("run-sequence"),
    source = require("vinyl-source-stream");

var wrap = require("./src/wrappers/gulpTask");

// -------------------------
// Build tasks
// -------------------------

gulp.task("build", function(callback) {
  return runSequence(
      "build:wrap",
      "build:browserify",
      "build:clean",
      "compress",
      callback
    );
});

gulp.task("build:browserify", function(callback){
  return runSequence("browserify:complete", "browserify:tracker", callback);
});

gulp.task("build:wrap", function(){
  return gulp.src(["./src/keen.js", "./src/keen-tracker.js"])
    .pipe(wrap("./library.js"))
    .pipe(rename({ extname: ".tmp" }))
    .pipe(gulp.dest("./src/"));
});

gulp.task("browserify:complete", function() {
  return browserify("./src/keen.tmp")
    .bundle()
    .pipe(source("keen.js"))
    .pipe(gulp.dest("./dist/"));
});

gulp.task("browserify:tracker", function() {
  return browserify("./src/keen-tracker.tmp")
    .bundle()
    .pipe(source("keen-tracker.js"))
    .pipe(gulp.dest("./dist/"));
});

gulp.task("build:clean", function(callback) {
  del(["./src/*.tmp"], callback);
});

gulp.task("compress", function(){
  return gulp.src([
      "./dist/keen.js",
      "./dist/keen-tracker.js",
      "./src/loader.js"
    ])
    .pipe(compress({ type: "js" }))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("./dist/"));
});

gulp.task("connect", function () {
  return connect.server({
      root: [ __dirname, "test", "test/unit", "test/vendor", "test/examples" ],
      port: 9999
    });
});

gulp.task("watch", function() {
  return gulp.watch([
      "src/**/*.js",
      "gulpfile.js"
    ], ["build"]);
});

gulp.task("watch-with-tests", function() {
  return gulp.watch([
      "src/**/*.js",
      "test/unit/**/*.*",
      "gulpfile.js"
    ], ["build", "test:server", "test:phantom"]);
});


// -------------------------
// Test tasks
// -------------------------

gulp.task("test:server", function () {
  return gulp.src("./test/unit/server.js", { read: false })
    .pipe(mocha({ reporter: "nyan" }));
});

gulp.task("test:unit:clean", function (callback) {
  del(["./test/unit/build"], callback);
});

gulp.task("test:unit:build", function () {
  return browserify("./test/unit/index.js", {
      insertGlobals: true,
      debug: true
    })
    .bundle()
    .pipe(source("browserified-tests.js"))
    .pipe(gulp.dest("./test/unit/build"));
});

gulp.task("test:unit:phantom", function () {
  return gulp.src("./test/unit/index.html")
    .pipe(mochaPhantomJS());
});

gulp.task("test:unit:karma", function (done){
  karma.start({
    configFile: __dirname + "/karma.conf.js",
    singleRun: true
  }, done);
});

gulp.task("test:unit:sauce", function(){
  karma.start({
    browsers: Object.keys(getCustomLaunchers()),
    browserDisconnectTimeout: 10 * 1000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 20 * 1000,
    captureTimeout: 300 * 1000,
    configFile : __dirname + "/karma.conf.js",
    customLaunchers: getCustomLaunchers(),
    logColors: true,
    reporters: [ "saucelabs" ],
    sauceLabs: {
      testName: moment().format("ddd, MMM Do, h:mm:ss a"),
      recordScreenshots: false,
      recordVideo: false,

    },
    singleRun  : true,
    action     : "run"
  });
});


// -------------------------
// Test bundles
// -------------------------

gulp.task("test:prepare", function (callback) {
  runSequence(
    "test:unit:clean",
    "test:unit:build",
    callback
  );
});

gulp.task("test:phantom", function (callback) {
  runSequence(
    "test:prepare",
    "test:unit:phantom",
    callback
  );
});

gulp.task("test:karma", function (callback){
  runSequence(
    "test:prepare",
    "test:unit:karma",
    callback
  );
});

gulp.task("test:sauce", function(callback){
  runSequence(
    "test:prepare",
    "test:unit:sauce",
    callback
  );
});

gulp.task("test:local", function(callback) {
  runSequence(
    // Node.js tests
    "test:server",
    // Browser tests
    "test:phantom",
    "test:karma",
    callback
  );
});

gulp.task("test:all", function(callback) {
  runSequence(
    "test:local",
    "test:sauce",
    callback
  );
});

gulp.task("test:ci", function(callback) {
  runSequence(
    "test:server",
    "test:phantom",
    "test:sauce",
    callback
  );
});




// -------------------------
// Deployment task
// -------------------------

gulp.task("deploy", function(callback){
  runSequence(
    "build",
    "test:local",
    "aws",
    callback
  );
});

gulp.task("aws", function() {

  if (!process.env.AWS_KEY || !process.env.AWS_SECRET) {
    throw "AWS credentials are required!";
  }

  var publisher = aws.create({
    key: process.env.AWS_KEY,
    secret: process.env.AWS_SECRET,
    bucket: pkg.name
  });

  var headers = {
    // Cache policy (1000 * 60 * 60 * 1) // 1 hour
    // "Cache-Control": "max-age=3600000, public",
    // "Expires": new Date(Date.now() + 3600000).toUTCString()
    "Cache-Control": "max-age=1000, public",
    "Expires": new Date(Date.now() + 1000).toUTCString()
  };

  return gulp.src([
      "./dist/keen.js",
      "./dist/keen.min.js",
      "./dist/keen-tracker.js",
      "./dist/keen-tracker.min.js"
    ])
    .pipe(rename(function(path) {
      path.dirname += "/" + pkg["version"];
    }))
    .pipe(aws.gzip())
    .pipe(publisher.publish(headers))
    .pipe(publisher.cache())
    .pipe(aws.reporter());

});


// -------------------------
// Bundled tasks
// -------------------------

gulp.task("default", function(callback){
  runSequence(
    "build",
    "connect",
    "watch",
    callback
  );
});

gulp.task("with-tests", function(callback){
  runSequence(
    "test:local",
    "build",
    "connect",
    "watch-with-tests",
    callback
  );
});


function getCustomLaunchers(){
  return {
    sl_ios: {
      base: "SauceLabs",
      browserName: "iPhone",
      platform: "OS X 10.9",
      version: "8.1"
    },
    sl_android: {
      base: "SauceLabs",
      browserName: "android",
      platform: "Linux",
      version: "4.4"
    },

    // sl_safari: {
    //   base: "SauceLabs",
    //   browserName: "safari",
    //   platform: "OS X 10.10",
    //   version: "8"
    // },

    sl_ie_11: {
      base: "SauceLabs",
      browserName: "internet explorer",
      platform: "Windows 8.1",
      version: "11"
    },
    sl_ie_10: {
      base: "SauceLabs",
      browserName: "internet explorer",
      platform: "Windows 8",
      version: "10"
    },
    sl_ie_9: {
      base: "SauceLabs",
      browserName: "internet explorer",
      platform: "Windows 7",
      version: "9"
    }
  };
}
