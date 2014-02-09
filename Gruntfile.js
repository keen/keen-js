module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: {
        stripBanners: true,
        process: function(src, filepath) {
          return '// Source: ' + filepath + '\n' + 
            src; //.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
        }
      },
      loader: {
        src: 'src/loader.js',
        dest: 'build/<%= pkg.name %>-<%= pkg.version %>.loader.js'
      },
      track: {
        src: [
          'src/intro.js', 
          'src/track.js', 
          'src/lib/base64.js',
          'src/lib/json2.js',
          'src/outro.js'
        ],
        dest: 'build/<%= pkg.name %>-<%= pkg.version %>.track.js'
      },
      query: {
      
      },
      chart: {
        
      }
    },

    uglify: {
      options : {
        beautify : {
          ascii_only : true
        }    
      },
      build: {
        files: {
          'build/<%= pkg.name %>-<%= pkg.version %>.track.min.js': 'build/<%= pkg.name %>-<%= pkg.version %>.track.js',
          'build/<%= pkg.name %>-<%= pkg.version %>.loader.min.js': 'build/<%= pkg.name %>-<%= pkg.version %>.loader.js'       
        }
      }
    },

    watch: {
      javascript: {
        files: 'src/**/*.js',
        tasks: [ 'concat', 'uglify' ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concat', 'uglify']);
};
