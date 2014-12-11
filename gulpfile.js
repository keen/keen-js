var gulp = require("gulp");

var browserify = require("browserify"),
    clean = require("gulp-clean"),
    connect = require("gulp-connect"),
    compress = require("gulp-yuicompressor"),
    gzip = require("gulp-gzip"),
    mocha = require("gulp-mocha"),
    mochaPhantomJS = require("gulp-mocha-phantomjs"),
    rename = require("gulp-rename"),
    runSequence = require("run-sequence"),
    source = require("vinyl-source-stream");


// -------------------------
// Build tasks
// -------------------------

gulp.task("build", function(callback) {
  return runSequence(
      "browserify-complete",
      "browserify-tracker",
      "compress",
      "gzip",
      callback
    );
});

gulp.task("browserify-complete", function() {
  return browserify("./src/keen.js", {
      // insertGlobals: true,
      // debug: true
    })
    .bundle()
    .pipe(source("keen.js"))
    .pipe(gulp.dest("./dist/"));
});

gulp.task("browserify-tracker", function() {
  return browserify("./src/keen-tracker.js")
    .bundle()
    .pipe(source("keen-tracker.js"))
    .pipe(gulp.dest("./dist/"));
});

gulp.task("compress", function(){
  return gulp.src([
      "./dist/keen.js",
      "./dist/keen-tracker.js"
    ])
    .pipe(compress({ type: "js" }))
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("./dist/"));
});

gulp.task("gzip", function(){
  return gulp.src([
    "./dist/keen.min.js",
    "./dist/keen-tracker.min.js"
    ])
    .pipe(gzip({ append: true }))
    .pipe(gulp.dest("./dist/"));
});

gulp.task("connect", function () {
  return connect.server({
      root: [ __dirname, "test", "test/unit", "test/vendor", "test/browser/examples" ],
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
    ], ["build", "test:unit"]);
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
