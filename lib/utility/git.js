'use strict';

var Logging = require('./logging'),
	Handlers = require('./handlers'),
	nodePath = require('path'),
	git = require('gift'),
	util = require('util'),
	fse = require('fs-extra'),
	config = require('../../config.json'),
	Module = function () {
	};

Module.remoteUrlFormat = 'git@bitbucket.org:%s/%s.git';
Module.remoteName = 'origin';
Module.developBranchName = 'develop';
Module.masterBranchName = 'master';

Module.init = function (path, domain, callback) {
	var repo = git(path),
		url = util.format(Module.remoteUrlFormat, config.bitbucket.owner, domain),
		gitignorePath = nodePath.resolve(__dirname, '../../templates/git/gitignore.txt'),
		gitignoreTargetPath = nodePath.resolve(path, '.gitignore');

	Logging.info('Copying .gitignore file');
	fse.copy(gitignorePath, gitignoreTargetPath, function (err) {
		Handlers.error(err);

		Logging.info('Initializing Git repository');
		git.init(path, function (err) {
			Handlers.error(err);

			Logging.info(util.format('Adding remote (%s) "%s" to Git repository', Module.remoteName, url));
			repo.remote_add(Module.remoteName, url, function (err) {
				Handlers.error(err);

				Logging.info('Adding .gitignore to the Git repository');
				repo.add('.gitignore', function (err) {
					Handlers.error(err);
					
					Logging.info('Performing initial commit to the Git repository');
					repo.commit('Initializing repository', function (err) {
						Handlers.error(err);

						Logging.info(util.format('Pushing master to remote (%s)', Module.remoteName));
						repo.remote_push(Module.remoteName + ' ' + Module.masterBranchName, function (err) {
							Handlers.error(err);

							Logging.info('Creating develop branch on the Git repository');
							repo.create_branch(Module.developBranchName, function (err) {
								Handlers.error(err);

								Logging.info('Checking out develop branch from the Git repository');
								repo.checkout(Module.developBranchName, function (err) {
									Handlers.error(err);

									Logging.info('Adding files to the Git repository');
									repo.add('.', function (err) {
										Handlers.error(err);

										Logging.info('Performing initial commit to develop branch in the Git repository');
										repo.commit('Adding initial files', function (err) {
											Handlers.error(err);

											Logging.info(util.format('Pushing develop to remote (%s)', Module.remoteName));
											repo.remote_push(Module.remoteName + ' ' + Module.developBranchName, function (err) {
												Handlers.error(err);

												if (callback) {
													callback(err);
												}
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
};

module.exports = Module;