module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-blanket');
  grunt.loadNpmTasks('grunt-coveralls');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-preprocess');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      coverage: {
        src: ['coverage/']
      }
    },

    copy: {
      coverage: {
        expand: true,
        cwd: 'test/',
        src: ['**'],
        dest: 'coverage/test'
      },
      config: {
        expand: true,
        cwd: 'config/',
        src: ['**'],
        dest: 'coverage/config'
      }
    },

    blanket: {
      coverage: {
        src: ['lib/'],
        dest: 'coverage/lib/'
      }      
    },

    mochaTest: {
      'spec': {
        options: {
          reporter: 'spec',
          timeout: 10000
        },
        src: ['coverage/test/**/*.js']
      },
      'html-cov': {
        options: {
          reporter: 'html-cov',
          quiet: true,
          captureFile: 'reports/coverage.html'
        },
        src: ['coverage/test/**/*.js']
      },
      'mocha-lcov-reporter': {
        options: {
          reporter: 'mocha-lcov-reporter',
          quiet: true,
          captureFile: 'reports/lcov.info'
        },
        src: ['coverage/test/**/*.js']
      },
      'travis-cov': {
        options: {
          reporter: 'travis-cov'
        },
        threshold: 0,
        src: ['coverage/test/**/*.js']
      }
    },

    jshint: {
      files: ['Gruntfile.js', 'lib/**/*.js'],
      options: {
        //curly: true,
        //eqnull: true,
        //eqeqeq: true,
        //undef: true,
        //immed: true,
        //latedef: true,
        //newcap: true,
        //noarg: true,
        //sub: true,
        //undef: true,
        //unused: true,
        boss: true,
        eqnull: true,
        node: true,
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },

    browserify: {
      dist: {
        src: ['lib/index.js'],
        dest: 'dist/tml.js',
        options: {
          exclude: ['request', 'redis', 'memcached', 'zlib', 'fs']
        }
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/tml.min.js': ['<%= browserify.dist.dest %>']
        }
      }
    },

    jsdoc : {
      dist : {
        src: ['src/**/*.js'],
        options: {
          destination: 'doc'
        }
      }
    },

    watch: {
      all: {
        files: ['lib/**/*.js', 'test/**/*.js'],
        tasks: ['browserify','uglify'] //NOTE the :run flag
      }
    },

    coveralls: {
      options: {
        force: true
      },
      all: {
        src: 'reports/lcov.info'
      }
    },

    preprocess : {
      inline : {
        src : [ 'dist/tml.js' ],
        options: {
          inline : true,
          context : { 
            NODE_ENV: process.env.NODE_ENV || 'development',
            VERSION: '<%= pkg.version %>'
          }
        }
      }
    }
  });

  //grunt.registerTask('test', ['jshint', 'blanket', 'copy', 'mochaTest', 'coveralls']);
  grunt.registerTask('test', ['jshint', 'blanket', 'copy', 'mochaTest']);
  grunt.registerTask('docs', ['jsdoc']);
  grunt.registerTask('build', ['jshint','browserify','preprocess','uglify']);

  // Default task(s).
  grunt.registerTask('default', ['test']);
};
