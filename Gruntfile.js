try {
	'use strict';

	var _ = require('underscore'),
		path = require('path-extra'),
		chalk = require('chalk');

	_.str = require('underscore.string');
	_.mixin(_.str.exports());

	module.exports = function (grunt) {
		// Load all grunt plugins
		require('matchdep').filter('grunt-*').forEach(grunt.loadNpmTasks);

		var target = grunt.option('target'),
			name = grunt.option('name'),
			domain = grunt.option('domain'),
			root,
			gitOptions = {
				'stdout': true,
				'stderr': true,
				'execOptions': {
					'cwd': '<%= config.paths.project.root %>'
				}
			},
			tempPath = path.join(path.tempdir(), 'rhythm.toolkit'),
			homePath = path.join(path.homedir(), '.rhythm.toolkit'),
			dataPath = path.join(homePath, 'data.json');

		if (!target) {
			grunt.fail.fatal('Target not specified');
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

		domain = domain || name; // Fall back to name if no domain specified

		grunt.loadTasks('./lib/grunt-file-regex-rename-mod/tasks');
		grunt.loadTasks('./lib/grunt-text-replace-mod/tasks');

		grunt.initConfig({
			'config': {
				'name': name,
				'domain': domain,
				'data': grunt.file.exists(dataPath) ? grunt.file.readJSON(dataPath) : {},
				'paths': {
					'bitbucket': 'https://bitbucket.org/api/2.0/repositories/<%= config.data.account %>/<%= config.name.toLowerCase() %>',
					'git': 'ssh://git@bitbucket.org/<%= config.data.account %>/',
					'temp': tempPath,
					'home': homePath,
					'templates': {
						'root': 'templates',
						'docs': 'docs/**',
						'frontend': 'frontend/**',
						'umbraco': 'umbraco/**',
						'gitignore': './templates/git/gitignore.txt'
					},
					'project': {
						'root': root || '.',
						'gitignore': '<%= config.paths.project.root %>/.gitignore',
						'trunk': '<%= config.paths.project.root %>/trunk',
						'frontend': '<%= config.paths.project.trunk %>/<%= config.name %>.Frontend',
						'website': '<%= config.paths.project.trunk %>/<%= config.name %>.Website',
						'umbraco': '<%= config.paths.project.website %>/<%= config.name %>.Website',
						'templates': {
							'frontend': '<%= config.paths.project.trunk %>/frontend',
							'umbraco': '<%= config.paths.project.trunk %>/umbraco'
						}
					}
				},
				'files': {
					'data': dataPath,
					'gitindexlock': '<%= config.paths.project.root %>/.git/index.lock',
					'zip': {
						'umbraco': '<%= config.paths.temp %>/umbraco-<%= config.files.remote.umbraco.version %>.zip'
					},
					'remote': {
						'umbraco': {
							'version': '7.1.4',
							'url': 'http://our.umbraco.org/ReleaseDownload?id=125627'
						}
					}
				}
			},

			'curl': {
				'umbraco': {
					'src': '<%= config.files.remote.umbraco.url %>',
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

			'http': {
				'create': {
					'options': {
						'url': '<%= config.paths.bitbucket %>',
						'method': 'POST',
						'auth': {
							'user': '<%= config.data.user %>',
							'pass': '<%= config.data.pass %>'
						},
						'body': 'name=<%= config.domain %>&is_private=1&description=Website%20for%20<%= config.domain %>'
					}
				},
				'delete': {
					'options': {
						'url': '<%= config.paths.bitbucket %>',
						'method': 'DELETE',
						'auth': {
							'user': '<%= config.data.user %>',
							'pass': '<%= config.data.pass %>'
						}
					}
				}
			},

			'shell': {
				'gitinit': {
					'options': gitOptions,
					'command': 'git init'
				},
				'gitclone': {
					'options': gitOptions,
					'command': 'git clone <%= config.paths.git %><%= config.name %>.git .'
				},
				'gitremote': {
					'options': gitOptions,
					'command': 'git remote add origin <%= config.paths.git %><%= config.name %>.git'
				},
				'gitcheckoutmaster': {
					'options': gitOptions,
					'command': 'git checkout -b master'
				},
				'gitcheckoutdevelop': {
					'options': gitOptions,
					'command': 'git checkout -b develop'
				},
				'gitcheckoutfrontend': {
					'options': gitOptions,
					'command': 'git checkout -b feature/frontend'
				},
				'gitadd': {
					'options': gitOptions,
					'command': 'git add -A'
				},
				'gitcommit': {
					'options': gitOptions,
					'command': 'git commit -m "Initial Commit."'
				},
				'gitpush': {
					'options': gitOptions,
					'command': 'git push --all'// origin -u'
				},
				'gitmerge': {
					'options': gitOptions,
					'command': 'git merge master'
				},
				'gitignore': {
					'options': {
						'stdout': true,
						'stderr': false
					},
					'command': 'cp "<%= config.paths.templates.gitignore %>" "<%= config.paths.project.gitignore %>"'
				},
				'gitautocrlf': {
					'options': gitOptions,
					'command': 'git config --global core.safecrlf false'
				},
				'npminstall': {
					'options': {
						'stdout': true,
						'stderr': false,
						'execOptions': {
							'cwd': '<%= config.paths.project.frontend %>'
						}
					},
					'command': 'npm install'
				}
			},

			'wait': {
				'gitindexlock': {
					'options': {
						'delay': 500,
						'before': function (options) {
							var lock = grunt.config.get('config.files.gitindexlock');

							if (!grunt.file.exists(lock)) {
								return false;
							}

							console.log('pausing %dms', options.delay);
						},
						'after': function () {
							var lock = grunt.config.get('config.files.gitindexlock');

							if (grunt.file.exists(lock)) {
								return true;
							}
						}
					}
				}
			},

			'attention': {
				'umbracounzip': {
					'options': {
						'message': 'Extracting "' + chalk.underline.blue('<%= config.files.zip.umbraco %>') + '". This may take a while.',
						'borderColor': 'blue',
						'border': 'double'
					}
				}
			},

			'git': [
				'shell:gitinit',
				'wait:gitindexlock',
				'shell:gitautocrlf',
				'wait:gitindexlock',
				'shell:gitremote',
				'wait:gitindexlock',
				'shell:gitignore',
				'wait:gitindexlock',
				'shell:gitcheckoutmaster',
				'wait:gitindexlock',
				'shell:gitadd',
				'wait:gitindexlock',
				'shell:gitcommit',
				'wait:gitindexlock',
				'shell:gitcheckoutdevelop',
				'wait:gitindexlock',
				'shell:gitcheckoutfrontend',
				'wait:gitindexlock',
				'shell:gitpush',
				'wait:gitindexlock'
			],

			'ifNotExists': {
				'umbraco': {
					'task': 'curl:umbraco',
					'file': '<%= config.files.zip.umbraco %>'
				}
			}
		});

		grunt.task.registerMultiTask('git', 'Git Tasks', function () {
			grunt.task.run(this.data);
		});

		grunt.task.registerTask('login', 'Login to BitBucket', function (account, user, pass) {
			if (!account) {
				grunt.fail.fatal('Parameter "account" missing.');
			}

			if (!user) {
				grunt.fail.fatal('Parameter "user" missing.');
			}

			if (!pass) {
				grunt.fail.fatal('Parameter "pass" missing.');
			}

			var file = grunt.config.get('config.files.data'),
				data = {
					'account': account,
					'user': user,
					'pass': pass
				};

			grunt.file.mkdir(path.dirname(file));

			grunt.file.write(file, JSON.stringify(data), {
				'encoding': 'utf-8'
			});
		});

		grunt.task.registerMultiTask('ifNotExists', 'Runs the specified task only if the specified file (must be a variable) does not exist', function () {
			if (this.data.file && this.data.task) {
				var filePath = grunt.config.process(this.data.file);

				if (!grunt.file.exists(filePath)) {
					grunt.task.run(this.data.task);
				}
			}
		});

		grunt.registerTask('umbraco', ['copy:docs', 'copy:frontend', 'copy:umbraco', 'fileregexrename-mod', 'replace-mod', 'rename', 'shell:npminstall', 'ifNotExists:umbraco', 'attention:umbracounzip', 'unzip:umbraco', 'http:create', 'git']);
		grunt.registerTask('frontend', ['copy:docs', 'copy:frontend', 'fileregexrename-mod', 'replace-mod', 'rename:frontend', 'shell:npminstall', 'http:create', 'git']);
		grunt.registerTask('frontend_test', ['copy:docs', 'copy:frontend', 'fileregexrename-mod', 'replace-mod', 'rename:frontend', 'shell:npminstall']);
		grunt.registerTask('umbraco_test', ['copy:docs', 'copy:frontend', 'copy:umbraco', 'fileregexrename-mod', 'replace-mod', 'rename', 'shell:npminstall', 'ifNotExists:umbraco', 'attention:umbracounzip', 'unzip:umbraco']);
	};

	process.on('uncaughtException', function (err) {
		console.error(err.stack);
	});
} catch (err) {
	console.error(err);
}