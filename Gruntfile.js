module.exports = function(grunt) {

    grunt.initConfig({
      jsdoc: {
        dist: {
          src: ['lib/*.js'], 
          options: {
            destination: 'doc'
          }
        }
      },
      jasmine_node: {
        coverage: {},
        options: {
          forceExit: true,
          match: '.',
          matchall: false,
          extensions: 'js',
          specNameMatcher: 'spec',
          jUnit: {
            report: true,
            savePath : "./build/reports/jasmine/",
            useDotNotation: true,
            consolidate: true
          }
        },
        all: ['spec/']
      }
    });
    
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-jasmine-node-coverage');
    
    grunt.registerTask('default', ['jasmine_node', 'jsdoc']);
    grunt.registerTask('test', ['jasmine_node']);

};