'use strict';

var Utility = require('../utility'),
	fse = require('fs-extra'),
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

		try {
			// Delete the project directory
			Utility.Logging.info('Deleting project directory');
			fse.removeSync(path);

			// Delete the repository in BitBucket
			Utility.Logging.info(util.format('Deleting Git repository named %s in BitBucket', domain));
			Utility.BitBucket.deleteRepository(domain, function (err, res, body) {
				//Utility.Handlers.error(err);
				//Utility.Logging.info(res);
				Utility.Logging.info(body);
			});
		} catch (err) {
			Utility.Handlers.error(err);
		}
	}
};