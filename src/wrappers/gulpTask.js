/*
  Custom UMD template handling
 */

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

module.exports = wrap;
