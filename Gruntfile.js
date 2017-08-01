module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-coveralls');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-preprocess');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      coverage: {
        src: ['coverage/']
      }
    },

    mochaTest: {
      'spec': {
        options: {
          reporter: 'spec',
          timeout: 10000
        },
        src: ['test/**/**/*.js']
      }
    },

    jshint: {
      files: ['Gruntfile.js', 'lib/**/**/*.js'],
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
        tasks: ['browserify','uglify']
      }
    },

    coveralls: {
      options: {
        force: true
      },
      all: {
        src: 'coverage/lcov.info'
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

  grunt.registerTask('test', ['clean', 'jshint', 'mochaTest']);
  grunt.registerTask('coverage', ['clean', 'jshint', 'mocha_istanbul:coverage', 'coveralls']);
  grunt.registerTask('docs', ['jsdoc']);
  grunt.registerTask('default', ['coverage']);
  grunt.registerTask('build', ['clean', 'jshint','browserify','preprocess','uglify']);
};
