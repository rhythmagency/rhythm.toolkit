'use strict';

var Promise = require('bluebird'),
	Logging = require('./logging'),
	Handlers = require('./handlers'),
	git = require('gift'),
	fse = Promise.promisify(require('fs-extra')),
	nodePath = require('path'),
	util = require('util'),
	config = require('../../config.json'),
	Module = function () {
	};

Module.remoteUrlFormat = 'git@bitbucket.org:%s/%s.git';
Module.remoteName = 'origin';
Module.developBranchName = 'develop';
Module.masterBranchName = 'master';

Module.init = function (path, domain) {
	var resolver = Promise.pending(),
		repo = git(path),
		url = util.format(Module.remoteUrlFormat, config.bitbucket.owner, domain),
		gitignorePath = nodePath.resolve(__dirname, '../../templates/git/gitignore.txt'),
		gitignoreTargetPath = nodePath.resolve(path, '.gitignore');

	Logging.info('Copying .gitignore file');

	fse.copyAsync(gitignorePath, gitignoreTargetPath)
		.then(function () {
			Logging.info('Initializing Git repository');

			var resolver = Promise.pending();
			git.init(path, function (err) {
				if (err) {
					resolver.reject(err);
				} else {
					resolver.fulfill();
				}
			});
			return resolver.promise;
		})
		.then(function () {
			Logging.info(util.format('Adding remote (%s) "%s" to Git repository', Module.remoteName, url));

			var resolver = Promise.pending();
			repo.remote_add(Module.remoteName, url, function (err) {
				if (err) {
					resolver.reject(err);
				} else {
					resolver.fulfill();
				}
			});
			return resolver.promise;
		})
		.then(function () {
			Logging.info('Adding .gitignore to the Git repository');

			var resolver = Promise.pending();
			repo.add('.gitignore', function (err) {
				if (err) {
					resolver.reject(err);
				} else {
					resolver.fulfill();
				}
			});
			return resolver.promise;
		})
		.then(function () {
			Logging.info('Performing initial commit to the Git repository');

			var resolver = Promise.pending();
			repo.commit('Initializing repository', function (err) {
				if (err) {
					resolver.reject(err);
				} else {
					resolver.fulfill();
				}
			});
			return resolver.promise;
		})
		.then(function () {
			Logging.info(util.format('Pushing master to remote (%s)', Module.remoteName));

			var resolver = Promise.pending();
			repo.remote_push(util.format('%s %s', Module.remoteName, Module.masterBranchName), function (err) {
				if (err) {
					resolver.reject(err);
				} else {
					resolver.fulfill();
				}
			});
			return resolver.promise;
		})
		.then(function () {
			Logging.info('Creating develop branch on the Git repository');

			var resolver = Promise.pending();
			repo.create_branch(Module.developBranchName, function (err) {
				if (err) {
					resolver.reject(err);
				} else {
					resolver.fulfill();
				}
			});
			return resolver.promise;
		})
		.then(function () {
			Logging.info('Checking out develop branch from the Git repository');

			var resolver = Promise.pending();
			repo.checkout(Module.developBranchName, function (err) {
				if (err) {
					resolver.reject(err);
				} else {
					resolver.fulfill();
				}
			});
			return resolver.promise;
		})
		.then(function () {
			Logging.info('Adding files to the Git repository');

			var resolver = Promise.pending();
			repo.add('.', function (err) {
				if (err) {
					resolver.reject(err);
				} else {
					resolver.fulfill();
				}
			});
			return resolver.promise;
		})
		.then(function () {
			Logging.info('Performing initial commit to develop branch in the Git repository');

			var resolver = Promise.pending();
			repo.commit('Adding initial files', function (err) {
				if (err) {
					resolver.reject(err);
				} else {
					resolver.fulfill();
				}
			});
			return resolver.promise;
		})
		.then(function () {
			Logging.info(util.format('Pushing develop to remote (%s)', Module.remoteName));

			var resolver = Promise.pending();
			repo.remote_push(util.format('%s %s', Module.remoteName, Module.developBranchName), function (err) {
				if (err) {
					resolver.reject(err);
				} else {
					resolver.fulfill();
				}
			});
			return resolver.promise;
		})
		.then(function () {
			resolver.fulfill();
		})
		.catch(function (e) {
			Handlers.error(e.stack);
		});

	return resolver.promise;
};

module.exports = Module;