var saucelabs = require('./config/saucelabs')(),
    aws = require('./config/aws')(),
    wraps = require('./config/wrappers')();

module.exports = function(grunt) {

  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks('grunt-s3');

  grunt.loadNpmTasks('grunt-saucelabs');

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    concat: {

      options: {
        stripBanners: {
          block: true,
          line: true
        },
        process: function(src, filepath) {
          var namespace = (grunt.option("namespace") || false);
          src = ((namespace) ? src.replace("'Keen'", "'" + namespace + "'") : src);
          return "// Source: " + filepath + "\n" + src;
        }
      },

      // Assemble Keen.Dataset
      dataset: {
        src: [
          "src/dataset/index.js",
          "src/dataset/**/*.js"
        ],
        dest: ".tmp/dataset.js"
      },

      // Assemble Keen.Dataviz
      dataviz: {
        src: [
          "src/dataviz/index.js",
          "src/dataviz/**/*.js"
        ],
        dest: ".tmp/dataviz.js"
      },

      // Assemble keen.js (full)
      all: {
        options: {
          // Library Banner/Footer (makes happy AMD modules)
          banner: wraps.libraryBanner,
          footer: wraps.libraryFooter
        },
        src: [
            "src/core.js"
          , "src/track.js"
          , "src/query.js"

          , "src/lib/base64.js"
          , "src/lib/json2.js"
          , "src/lib/keen-domready.js"
          , "src/lib/keen-spinner.js"

          , ".tmp/dataset.js"
          , ".tmp/dataviz.js"
          , "src/visualization.js"
          , "src/async.js"
        ],
        dest: "dist/<%= pkg.name %>.js"
      },

      // Assemble keen-tracking.js
      tracker: {
        options: {
          banner: wraps.libraryBanner,
          footer: wraps.libraryFooter
        },
        src: [
            "src/core.js"
          , "src/track.js"
          , "src/lib/base64.js"
          , "src/lib/json2.js"
          , "src/lib/keen-domready.js"
          , "src/async.js"
        ],
        dest: "dist/<%= pkg.name %>-tracker.js"
      },

      // Build adapters as stand-alone modules
      adapters: {
        options: {
          // Adapter Banner/Footer (makes happy AMD modules)
          banner: wraps.adapterBanner,
          footer: wraps.adapterFooter
        },
        files: {
          ".tmp/keen-adapter-google.js"  : ["src/dataviz/adapters/google.js"],
          ".tmp/keen-adapter-chartjs.js" : ["src/dataviz/adapters/chartjs.js"],
          ".tmp/keen-adapter-c3.js"      : ["src/dataviz/adapters/c3.js"]
        }
      },

      // Build unit tests
      test: {
        src: [
            "test/unit/core.js"
          , "test/unit/track.js"
          , "test/unit/query.js"
          , "test/unit/dataviz.js"
          , "test/unit/dataset.js"
          , "test/unit/visualization.js"
          , "test/unit/utils.js"
        ],
        dest: "test/keen-unit-all.js"
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
      },
      tests: {
        files: "test/unit/**/*.js",
        tasks: [ "concat" ]
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
          concurrency: saucelabs.concurrency,
          sauceConfig: {
            'video-upload-on-pass': false
          }
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
          // Two Year cache policy (1000 * 60 * 60 * 1) // 1 hour
          "Cache-Control": "max-age=3600000, public",
          "Expires": new Date(Date.now() + 3600000).toUTCString()
        },
        gzip: true
      },
      release: {
        upload: [
          {
            src: 'dist/*',
            dest: 'latest/'
          },
          {
            src: 'dist/*',
            dest: '<%= pkg.version %>/'
          }
        ]/*,
        sync: [
          {
            src: 'dist/*',
            dest: '<%= pkg.version %>/'
          }
        ]*/
      },
      staging: {
        upload: [
          {
            src: 'dist/*',
            dest: 'staging/',
            options: {
              headers: {
                "Cache-Control": "max-age=1000, public",
                "Expires": new Date(Date.now() + 1000).toUTCString()
              }
            }
          }
        ]
      }
    }

  });

  grunt.registerTask('build', ['concat', 'uglify']);
  grunt.registerTask('dev', ['build', 'connect', 'watch']);
  grunt.registerTask('test', ['build', 'connect', 'saucelabs-mocha']);
  grunt.registerTask('default', ['build']);
};
