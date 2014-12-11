var gulp = require("gulp");

var browserify = require("browserify"),
    clean = require("gulp-clean"),
    connect = require("gulp-connect"),
    mocha = require('gulp-mocha'),
    mochaPhantomJS = require("gulp-mocha-phantomjs"),
    runSequence = require("run-sequence"),
    source = require("vinyl-source-stream");


// -------------------------
// Build tasks
// -------------------------

gulp.task("build", function(callback) {
  runSequence(
    "browserify",
    callback
  );
});

gulp.task("browserify", function() {
  return browserify("./src/keen.js", {
    insertGlobals: true,
    debug: true
  })
  .bundle()
  .pipe(source("keen.js"))
  .pipe(gulp.dest("./dist/"));
});

gulp.task("connect", function () {
  connect.server({
    root: [ __dirname, "test", "test/unit", "test/vendor", "test/browser/examples" ],
    port: 9999
  });
});

gulp.task("watch", function() {
  gulp.watch(["src/**/*.js"], ["build"]);
});

gulp.task("watch-with-tests", function() {
  gulp.watch(["src/**/*.js", "test/unit/**/*.*"], ["build", "test:unit"]);
});


// -------------------------
// Test tasks
// -------------------------

gulp.task("test:unit", function(callback) {
  runSequence(
    "test:server",
    "test:unit:clean",
    "test:unit:build",
    "test:unit:run",
    callback
  );
});

gulp.task("test:unit:clean", function() {
  return gulp.src("./test/unit/build", { read: false })
  .pipe(clean());
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

gulp.task("test:unit:run", function () {
  return gulp.src("./test/unit/index.html")
  .pipe(mochaPhantomJS());
});

gulp.task("test:server", function () {
  return gulp.src("./test/unit/server.js", { read: false })
  .pipe(mocha({ reporter: "nyan" }));
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
    "test:unit",
    "build",
    "connect",
    "watch-with-tests",
    callback
  );
});
