var moment = require("moment");

module.exports = function(config) {
  config.set({
    browsers: [ "Chrome", "Firefox", "Safari" ],
    frameworks: [ "mocha", "sinon" ],
    files: [
      // Include requirejs presence
      "./test/vendor/requirejs-bower",
      "./test/unit/build/browserified-tests.js"
    ],
    client: {
      mocha: {
        reporter: "html",
        ui: "bdd"
      }
    },
    reporters: [ "nyan" ],
    singleRun: true
  });
};
