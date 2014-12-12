var gulp = require("gulp"),
    pkg = require("./package.json");

var aws = require("gulp-awspublish"),
    browserify = require("browserify"),
    clean = require("gulp-clean"),
    connect = require("gulp-connect"),
    compress = require("gulp-yuicompressor"),
    gzip = require("gulp-gzip"),
    mocha = require("gulp-mocha"),
    mochaPhantomJS = require("gulp-mocha-phantomjs"),
    rename = require("gulp-rename"),
    runSequence = require("run-sequence"),
    source = require("vinyl-source-stream");
    // wrap = require("gulp-wrap");

/*
  TODO:
  [x] minify src/loader.js
  [x] S3->CDN release task
  [ ] Saucelabs or comparable
*/


// -------------------------
// Build tasks
// -------------------------

gulp.task("build", function(callback) {
  return runSequence(
      "build:wrappers",
      "browserify-complete",
      "browserify-tracker",
      "build:clean",
      "compress",
      // "gzip",
      callback
    );
});

gulp.task("build:wrappers", function(){
  return gulp.src(["./src/keen.js", "./src/keen-tracker.js"])
    .pipe(wrap("./src/umd-templates/library-wrapper.js"))
    .pipe(rename({ extname: ".tmp" }))
    .pipe(gulp.dest("./src/"));
});

gulp.task("browserify-complete", function() {
  return browserify("./src/keen.tmp")
    .bundle()
    .pipe(source("keen.js"))
    .pipe(gulp.dest("./dist/"));
});

gulp.task("browserify-tracker", function() {
  return browserify("./src/keen-tracker.tmp")
    .bundle()
    .pipe(source("keen-tracker.js"))
    .pipe(gulp.dest("./dist/"));
});

gulp.task("build:clean", function() {
  return gulp.src("./src/*.tmp", { read: false })
  .pipe(clean());
});

// gulp.task("library-umd", function() {
//   return gulp.src("src/*.js")
//   .pipe(umd())
//   .dest("build");
// });

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
// Deployment task
// -------------------------

gulp.task("deploy", function(callback){
  runSequence(
    "build",
    "test:unit",
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
      // path.basename += "-test";
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
    "test:unit",
    "build",
    "connect",
    "watch-with-tests",
    callback
  );
});

var es = require("event-stream"),
    fs = require("fs"),
    gutil = require("gulp-util"),
    path = require("path"),
    tpl = require("lodash.template");

function wrap(template){
  var template = fs.readFileSync( path.join(__dirname, template) );
  return es.map(function(file, callback) {
    build(file, template, callback);
  });
}

function build(file, template, callback) {
  var data = {};
  data.file = file;
  if (gutil.isStream(file.contents)) {
    var through = es.through();
    var wait = es.wait(function(err, contents) {
      data.contents = contents;
      // console.log(tpl(template, data))
      through.write( tpl(template, data) );
      through.end();
    });
    file.contents.pipe(wait);
    file.contents = through;
  }
  if (gutil.isBuffer(file.contents)) {
    data.contents = file.contents.toString();
    file.contents = new Buffer(tpl(template, data));
  }
  callback(null, file);
}
