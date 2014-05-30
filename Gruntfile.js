var saucelabs = require('./config/saucelabs')(),
    aws = require('./config/aws')();

module.exports = function(grunt) {

  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks('grunt-s3');

  grunt.loadNpmTasks('grunt-saucelabs');

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    copy: {
      build: {
        src: "bower_components/dataform/dist/dataform.js",
        dest: "src/lib/keen-dataform.js",
        options: {
          process: function (content, path) {
            return content.replace("\'Dataform\', this", "\'Dataform\', Keen");
          }
        }
      }
    },

    concat: {
      options: {
        stripBanners: true,
        process: function(src, filepath) {
          var namespace = (grunt.option("namespace") || false);
          src = ((namespace) ? src.replace("'Keen'", "'" + namespace + "'") : src);
          return "  // Source: " + filepath + "\n" + src;
        }
      },
      all: {
        src: [
          "src/_intro.js",
          "src/core.js",
          "src/track.js",
          "src/query.js",
          "src/lib/keen-dataform.js",
          "src/visualize.js",
          "src/lib/base64.js",
          "src/lib/json2.js",
          "src/async.js",
          "src/_outro.js",
          "src/plugins/keen-googlecharts.js",
          "src/plugins/keen-widgets.js"
        ],
        dest: "dist/<%= pkg.name %>.js"
      },
      tracker: {
        src: [
          "src/_intro.js",
          "src/core.js",
          "src/track.js",
          "src/lib/base64.js",
          "src/lib/json2.js",
          "src/async.js",
          "src/_outro.js"
        ],
        dest: "dist/<%= pkg.name %>-tracker.js"
      },
      loader: {
        src: "src/loader.js",
        dest: "dist/<%= pkg.name %>-loader.js"
      }
    },

    uglify: {
      options : {
        beautify : {
          ascii_only : true
        }
      },
      dist: {
        files: {
          "dist/<%= pkg.name %>.min.js": "dist/<%= pkg.name %>.js",
          "dist/<%= pkg.name %>-tracker.min.js": "dist/<%= pkg.name %>-tracker.js",
          "dist/<%= pkg.name %>-loader.min.js": "dist/<%= pkg.name %>-loader.js"
        }
      }
    },

    watch: {
      javascript: {
        files: "src/**/*.js",
        tasks: [ "concat", "uglify" ]
      }
    },

    connect: {
      server: {
        options: {
          base: 'test',
          port: 9999
        }
      }
    },

    'saucelabs-mocha': {
      all: {
        options: {
          testname: new Date().toISOString(),
          username: saucelabs.username,
          key: saucelabs.key,
          build: process.env.TRAVIS_JOB_ID,
          urls: saucelabs.urls,
          browsers: saucelabs.browsers,
          concurrency: saucelabs.concurrency
        }
      }
    },

    s3: {
      options: {
        key: aws.key,
        secret: aws.secret,
        bucket: aws.bucket,
        access: 'public-read',
        headers: {
          // Two Year cache policy (1000 * 60 * 60 * 24 * 1) // temp: 1 day
          "Cache-Control": "max-age=630720000, public",
          "Expires": new Date(Date.now() + 63072000000).toUTCString()
        },
        gzip: true
      },
      deploy: {
        upload: [
          {
            src: 'dist/*',
            dest: 'latest/'
          }
        ],
        sync: [
          {
            src: 'dist/*',
            dest: '<%= pkg.version %>/'
          }
        ]
      }
    }

  });

  grunt.registerTask('build', ['copy', 'concat', 'uglify']);
  grunt.registerTask('dev', ['build', 'connect', 'watch']);
  grunt.registerTask('test', ['build', 'connect', 'saucelabs-mocha']);
  grunt.registerTask('default', ['build']);
};
