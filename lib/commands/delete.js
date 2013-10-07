'use strict';

var Promise = require('bluebird'),
	Utility = require('../utility'),
	fse = Promise.promisify(require('fs-extra')),
	nodePath = require('path'),
	util = require('util');

module.exports = {
	'command': 'delete [domain] [path]',
	'description': 'Deletes a project and it\'s repository.',
	'action': function (domain, path, program) {
		// Fix the path
		if (!program) {
			path = null;
		}

		path = nodePath.resolve(process.cwd(), path || '');

		Utility.Logging.info('Deleting project directory')
			.then(function () {
				return fse.removeAsync(path);
			})
			.then(function () {
				Utility.Logging.info(util.format('Deleting Git repository named %s in BitBucket', domain));
				return Utility.BitBucket.deleteRepository(domain);
			})
			.then(function (res, body) {
				Utility.Logging.info(body);
			})
			.catch(function (e) {
				Utility.Handlers.error(e);
			});
	}
};