module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        font: {
            icons: {
                src: ['app/public/fonts/svg-icons/*.svg'],
                destCss: 'app/public/styles/less/icons.less',
                destFonts: 'app/public/fonts/icons.woff',

                // Optional: Custom routing of font filepaths for CSS
                cssRouter: function (fontpath) {
                    var pathArray = fontpath.split('/');
                    var fileName = pathArray[pathArray.length - 1];
                    return '/public/fonts/' + fileName;
                }
            }
        },
        less: {
            all: {
                files: {
                    'app/public/styles/main.css': [ 'app/public/styles/less/main.less' ],
                    'app/public/styles/index.css': [ 'app/public/styles/less/index.less' ],
                    'app/public/styles/launchTest.css': [ 'app/public/styles/less/launchTest.less' ],
                    'app/public/styles/results.css': [ 'app/public/styles/less/results.less' ]
                }
            }
        },
        jshint: {
            all: [
                '*.js',
                'app/lib/*.js',
                'bin/*.js',
                'lib/**/*.js',
                'app/nodeControllers/*.js',
                'app/public/scripts/*.js',
                'phantomas_custom/**/*.js',
                'test/**/*.js'
            ]
        },
        clean: {
            icons: {
                src: ['tmp']
            },
            coverage: {
                src: ['coverage/']
            }
        },
        copy: {
            coverage: {
                files: [
                    {src: ['test/**'], dest: 'coverage/'},
                    {src: ['lib/metadata/**'], dest: 'coverage/'}
                ]
            }
        },
        blanket: {
            coverageApp: {
                src: ['app/'],
                dest: 'coverage/app/'
            },
            coverageLib: {
                src: ['lib/'],
                dest: 'coverage/lib/'
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                },
                src: ['coverage/test/core/*.js', 'coverage/test/api/*.js']
            },
            'test-current-work': {
                options: {
                    reporter: 'spec',
                },
                src: ['coverage/test/server/runsDatastoreTest.js']
            },
            coverage: {
                options: {
                    reporter: 'html-cov',
                    quiet: true,
                    captureFile: 'coverage/coverage.html'
                },
                src: ['coverage/test/api/*.js']
            }
        },
        express: {
            test: {
                options: {
                    port: 8388,
                    bases: 'test/www'
                }
            }
        }
    });

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.registerTask('icons', [
        'font:icons',
        'less',
        'clean:icons'
    ]);

    grunt.registerTask('build', [
        'less'
    ]);

    grunt.registerTask('hint', [
        'jshint'
    ]);

    grunt.registerTask('test', [
        'build',
        'jshint',
        'express:test',
        'clean:coverage',
        'blanket',
        'copy:coverage',
        'mochaTest:test',
        'mochaTest:coverage'
    ]);

    grunt.registerTask('test-current-work', [
        'build',
        'jshint',
        'express:test',
        'clean:coverage',
        'blanket',
        'copy:coverage',
        'mochaTest:test-current-work'
    ]);

};