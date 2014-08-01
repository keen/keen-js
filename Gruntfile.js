var aws = require('./config/aws')();
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options : {
        beautify : {
          ascii_only : true
        }
      },
      build: {
        files: {
          //'build/<%= pkg.name %>-<%= pkg.version %>-min.js': [ 'src/<%= pkg.name %>.js' ],
          'build/<%= pkg.name %>.min.js': [ 'src/<%= pkg.name %>.js' ],
          'build/loader.min.js': [ 'src/loader.js' ]
        }
        // src: 'src/<%= pkg.name %>.js',
        // dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    s3: {
      options: {
        key: aws.key,
        secret: aws.secret,
        bucket: aws.bucket,
        access: 'public-read',
        headers: {
          // Two Year cache policy (1000 * 60 * 60 * 24 * 730)
          "Cache-Control": "max-age=86400000, public",
          "Expires": new Date(Date.now() + 86400000).toUTCString()
        },
        gzip: true
      },
      release: {
        sync: [
          {
            src: 'build/<%= pkg.name %>.min.js',
            dest: '<%= pkg.version %>/<%= pkg.name %>.min.js'
          },
          {
            src: 'src/<%= pkg.name %>.js',
            dest: '<%= pkg.version %>/<%= pkg.name %>.js'
          }
        ]
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-s3');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);

};
