'use strict';

var Logging = require('./logging'),
	Handlers = require('./handlers'),
	promisify = require('./promise').promisify,
	Promise = require('bluebird'),
	git = require('gift'),
	fse = require('fs-extra'),
	nodePath = require('path'),
	util = require('util'),
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

	promisify(fse.copy, fse, gitignorePath, gitignoreTargetPath)
		.then(function () {
			Logging.info('Initializing Git repository');
			return promisify(git.init, git, path);
		})
		.then(function () {
			Logging.info(util.format('Adding remote (%s) "%s" to Git repository', Module.remoteName, url));
			return promisify(repo.remote_add, repo, Module.remoteName, url);
		})
		.then(function () {
			Logging.info('Adding .gitignore to the Git repository');
			return promisify(repo.add, repo, '.gitignore');
		})
		.then(function () {
			Logging.info('Performing initial commit to the Git repository');
			return promisify(repo.commit, repo, 'Initializing repository');
		})
		.then(function () {
			Logging.info(util.format('Pushing master to remote (%s)', Module.remoteName));
			return promisify(repo.remote_push, repo, Module.remoteName + ' ' + Module.masterBranchName);
		})
		.then(function () {
			Logging.info('Creating develop branch on the Git repository');
			return promisify(repo.create_branch, repo, Module.developBranchName);
		})
		.then(function () {
			Logging.info('Checking out develop branch from the Git repository');
			return promisify(repo.checkout, repo, Module.developBranchName);
		})
		.then(function () {
			Logging.info('Adding files to the Git repository');
			return promisify(repo.add, repo, '.');
		})
		.then(function () {
			Logging.info('Performing initial commit to develop branch in the Git repository');
			return promisify(repo.commit, repo, 'Adding initial files');
		})
		.then(function () {
			Logging.info(util.format('Pushing develop to remote (%s)', Module.remoteName));
			return promisify(repo.remote_push, repo, Module.remoteName + ' ' + Module.developBranchName);
		})
		.finally(function () {
			if (callback) {
				callback();
			}
		})
		.catch(function (e) {
			Handlers.error(e);
		});
};

module.exports = Module;