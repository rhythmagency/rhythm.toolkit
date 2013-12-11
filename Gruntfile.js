'use strict';

var _ = require('underscore'),
	path = require('path-extra');

_.str = require('underscore.string');
_.mixin(_.str.exports());

module.exports = function (grunt) {
	// Load all grunt plugins
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	var target = grunt.option('target'),
		name = grunt.option('name'),
		root;

	if (!target) {
		grunt.fail.fatal('-target not specified');
	} else {
		target = _(target).chain().trim().rtrim('/').rtrim('\\').value();

		if (!grunt.file.exists(target)) {
			grunt.fail.fatal('Target \"' + target + '\" does not exist.');
		} else if (!grunt.file.isDir(target)) {
			grunt.fail.fatal('Target \"' + target + '\" is not a directory.');
		} else {
			root = target
		}
	}

	if (!name) {
		grunt.fail.fatal('-name not specified');
	}

	grunt.loadNpmTasks('grunt-file-regex-rename-mod');
	grunt.loadNpmTasks('grunt-text-replace-mod');

	grunt.initConfig({
		'config': {
			'pkg': grunt.file.readJSON('package.json'),
			'name': name,
			'paths': {
				'temp': path.join(path.tempdir(), 'rhythm.toolkit'),
				'templates': {
					'root': 'templates',
					'docs': 'docs/**',
					'frontend': 'frontend/**',
					'umbraco': 'umbraco/**'
				},
				'project': {
					'root': root || '.',
					'trunk': '<%= config.paths.project.root %>/trunk',
					'frontend': '<%= config.paths.project.trunk %>/<%= config.name %>.Frontend',
					'website': '<%= config.paths.project.trunk %>/<%= config.name %>.Website',
					'umbraco': '<%= config.paths.project.website %>/<%= config.name %>.Website',
					'css': '<%= config.paths.project.frontend %>/css',
					'less': '<%= config.paths.project.frontend %>/less',
					'sass': '<%= config.paths.project.frontend %>/sass',
					'js': '<%= config.paths.project.frontend %>/js',
					'templates': {
						'frontend': '<%= config.paths.project.trunk %>/frontend',
						'umbraco': '<%= config.paths.project.trunk %>/umbraco'
					}
				}
			},
			'files': {
				'app_js': '<%= config.paths.project.js %>/app.js',
				'app_min_js': '<%= config.paths.project.js %>/app.min.js',
				'app_css': '<%= config.paths.project.css %>/app.css',
				'app_css_map': '<%= config.paths.project.css %>/app.css.map',
				'app_less': '<%= config.paths.project.less %>/app.less',
				'app_sass': '<%= config.paths.project.sass %>/app.scss',
				'zip': {
					'umbraco': '<%= config.paths.temp %>/umbraco.zip'
				},
				'remote': {
					'umbraco': 'http://our.umbraco.org/ReleaseDownload?id=100660'
				}
			},
			'watch': {
				'glob': '<%= config.paths.project.js %>/**/*. %>',
				'js': '<%= config.watch.glob %>/js %>',
				'js_hbs': '<%= config.watch.glob %>/hbs %>',
				'js_jade': '<%= config.watch.glob %>/jade %>',
				'less': '<%= config.watch.glob %>/less %>',
				'sass': '<%= config.watch.glob %>/scss %>'
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
				'files': ['<%= config.watch.js %>', '<%= config.watch.js_hbs %>', '<%= config.watch.js_jade %>', '!<%= config.files.app_min_js %>'],
				'tasks': ['build:js']
			},
			'css': {
				'files': ['<%= config.watch.less %>', '<%= config.watch.sass %>'],
				'tasks': ['build:css']
			}
		},

		'curl': {
			'umbraco': {
				'src': '<%= config.files.remote.umbraco %>',
				'dest': '<%= config.files.zip.umbraco %>'
			}
		},

		'copy': {
			'docs': {
				'expand': true,
				'flatten': false,
				'cwd': '<%= config.paths.templates.root %>',
				'src': '<%= config.paths.templates.docs %>',
				'dest': '<%= config.paths.project.root %>'
			},
			'frontend': {
				'expand': true,
				'flatten': false,
				'cwd': '<%= config.paths.templates.root %>',
				'src': '<%= config.paths.templates.frontend %>',
				'dest': '<%= config.paths.project.trunk %>'
			},
			'umbraco': {
				'expand': true,
				'flatten': false,
				'cwd': '<%= config.paths.templates.root %>',
				'src': '<%= config.paths.templates.umbraco %>',
				'dest': '<%= config.paths.project.trunk %>'
			}
		},

		'rename': {
			'frontend': {
				'src': '<%= config.paths.project.templates.frontend %>',
				'dest': '<%= config.paths.project.frontend %>'
			},
			'umbraco': {
				'src': '<%= config.paths.project.templates.umbraco %>',
				'dest': '<%= config.paths.project.website %>'
			}
		},

		'unzip': {
			'umbraco': {
				'files': [
					{
						'src': '<%= config.files.zip.umbraco %>',
						'dest': '<%= config.paths.project.umbraco %>'
					}
				]
			}
		},

		'fileregexrename-mod': {
			'build': {
				'files': {
					'<%= config.paths.project.trunk %>': '<%= config.paths.project.trunk %>/**'
				},
				'options': {
					'replacements': [
						{
							'pattern': 'RHYTHM',
							'replacement': '<%= config.name %>'
						}
					]
				}
			}
		},

		'replace-mod': {
			'build': {
				'src': ['<%= config.paths.project.trunk %>/**'],
				'overwrite': true,
				'replacements': [
					{
						'from': 'RHYTHM',
						'to': '<%= config.name %>'
					}
				]
			}
		},

		'auto_install': {
			'options': {
				'cwd': '<%= config.paths.project.frontend %>',
				'stdout': true,
				'stderr': true,
				'failOnError': true
			}
		},

		'build': {
			'js': ['browserify', 'uglify'],
			'css': ['less', 'sass', 'cssc', 'cssmin']
		}
	});

	grunt.registerTask('default', ['build']);
	grunt.registerTask('umbraco', ['copy:docs', 'copy:frontend', 'copy:umbraco', 'fileregexrename-mod', 'replace-mod', 'rename', 'auto_install', 'curl:umbraco', 'unzip:umbraco']);
	grunt.registerTask('frontend', ['copy:docs', 'copy:frontend', 'fileregexrename-mod', 'replace-mod', 'rename:frontend', 'auto_install']);
	grunt.task.registerMultiTask('build', 'Build', function () {
		grunt.task.run(this.data);
	});
};
