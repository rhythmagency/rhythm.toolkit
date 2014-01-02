'use strict';

module.exports = function (grunt) {
	// Load all grunt plugins
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		'config': {
			'name': 'test',
			'paths': {
				'project': {
					'public': './public',
					'css': '<%= config.paths.project.public %>/css',
					'less': '<%= config.paths.project.public %>/less',
					'sass': '<%= config.paths.project.public %>/sass',
					'js': '<%= config.paths.project.public %>/js',
					'js_node_modules': './node_modules/RHYTHM'
				}
			},
			'files': {
				'app_js': '<%= config.paths.project.js %>/app.js',
				'app_min_js': '<%= config.paths.project.js %>/app.min.js',
				'app_css': '<%= config.paths.project.css %>/app.css',
				'app_css_map': '<%= config.paths.project.css %>/app.css.map',
				'app_less': '<%= config.paths.project.less %>/app.less',
				'app_sass': '<%= config.paths.project.sass %>/app.scss'
			},
			'watch': {
				'js': '<%= config.paths.project.js %>/**/*.js',
				'js_node_modules': '<%= config.paths.project.js_node_modules %>/**/*.js',
				'js_hbs': '<%= config.paths.project.js %>/**/*.hbs',
				'js_jade': '<%= config.paths.project.js %>/**/*.jade',
				'less': '<%= config.paths.project.less %>/**/*.less',
				'sass': '<%= config.paths.project.sass %>/**/*.scss'
			}
		},

		'uglify': {
			'build': {
				'files': {
					'<%= config.files.app_min_js %>': ['<%= config.files.app_min_js %>']
				}
			}
		},

		'browserify': {
			'build': {
				'files': {
					'<%= config.files.app_min_js %>': ['<%= config.files.app_js %>']
				},
				'options': {
					transform: ['hbsfy', 'simple-jadeify']
				}
			}
		},

		'cssc': {
			'build': {
				'options': {
					'consolidateViaDeclarations': true,
					'consolidateViaSelectors': true,
					'consolidateMediaQueries': true
				},
				'files': {
					'<%= config.files.app_css %>': '<%= config.files.app_css %>'
				}
			}
		},

		'cssmin': {
			'build': {
				'src': '<%= config.files.app_css %>',
				'dest': '<%= config.files.app_css %>'
			}
		},

		'sass': {
			'build': {
				'files': {
					'<%= config.files.app_css %>': '<%= config.files.app_sass %>'
				}
			}
		},

		'less': {
			'build': {
				'options': {
					'compress': true,
					'cleancss': true,
					'sourceMap': true,
					'sourceMapFilename': '<%= config.files.app_css_map %>'
				},
				'files': {
					'<%= config.files.app_css %>': '<%= config.files.app_less %>'
				}
			}
		},

		'watch': {
			'js': {
				'files': ['<%= config.watch.js %>', '<%= config.watch.js_node_modules %>', '<%= config.watch.js_hbs %>', '<%= config.watch.js_jade %>', '!<%= config.files.app_min_js %>'],
				'tasks': ['browserify', 'uglify']
			},
			'css': {
				'files': ['<%= config.watch.less %>', '<%= config.watch.sass %>'],
				'tasks': ['less', 'sass', 'cssc', 'cssmin']
			}
		}
	});

	grunt.registerTask('default', ['watch']);
};
