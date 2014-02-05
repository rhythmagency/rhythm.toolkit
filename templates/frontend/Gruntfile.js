'use strict';

module.exports = function (grunt) {
	var _ = require('lodash');

	// Load all grunt plugins
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		'config': {
			'paths': {
				'public': './public',
				'js': '<%= config.paths.public %>/js',
				'js_node_modules': './node_modules/RHYTHM',
				'js_jade': '<%= config.paths.js_node_modules %>/lib/templates'
			},
			'files': {
				'js': '<%= config.paths.js_node_modules %>/**/*.js',
				'js_app': '<%= config.paths.js %>/app.js',
				'js_app_min': '<%= config.paths.js %>/app.min.js',
				'js_templates': '<%= config.paths.js_jade %>/templates.js',
				'js_jade': '<%= config.paths.js_jade %>/**/*.jade'
			},
			'watch': {
				'js': '<%= config.paths.js %>/**/*.js',
				'js_node_modules': '<%= config.paths.js_node_modules %>/**/*.js',
				'js_jade': '<%= config.paths.js_jade %>/*.jade'
			}
		},

		'jade': {
			'options': {
				'client': true,
				'amd': false
			},
			'<%= config.files.js_templates %>': '<%= config.watch.js_jade %>'
		},
		'surround': {
			'options': {
				'prepend': ';(function() { var jade = require("jade/runtime");',
				'append': 'module.exports = this["JST"];})();'
			},
			'<%= config.files.js_templates %>': '<%= config.files.js_templates %>'
		},
		'replace': {
			'build': {
				'src': ['<%= config.files.js_templates %>'],
				'overwrite': true,
				'replacements': [
					{
						'from': '<%= config.paths.js_jade %>/',
						'to': ''
					}
				]
			}
		},
		'uglify': {
			'build': {
				'files': {
					'<%= config.files.js_app_min %>': ['<%= config.files.js_app_min %>']
				}
			}
		},
		'browserify': {
			'build': {
				'files': {
					'<%= config.files.js_app_min %>': ['<%= config.files.js_app %>']
				}
			}
		},
		'watch': {
			'options': {
				'debounceDelay': 250
			},
			'jade': {
				'files': '<%= config.files.js_jade %>',
				'tasks': 'build:jade'
			},
			'js': {
				'files': '<%= config.files.js %>',
				'tasks': 'build:js'
			}
		},
		'build': {
			'jade': ['jade', 'surround', 'replace'],
			'js': ['browserify', 'uglify']
		},
		'concurrent': {
			'watch': {
				'options': {
					'logConcurrentOutput': true
				},
				'tasks': ['watch:jade', 'watch:js']
			}
		}
	});


	grunt.task.registerMultiTask('build', 'Build Jade or JavaScript files.', function () {
		grunt.task.run(this.data);
	});

	grunt.task.registerTask('default', ['concurrent']);
};