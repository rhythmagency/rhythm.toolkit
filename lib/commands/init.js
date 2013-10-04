'use strict';

var _ = require('underscore'),
	Utility = require('../utility'),
	ProjectTypes = require('../project-types'),
	fse = require('fs-extra'),
	nodePath = require('path'),
	util = require('util'),
	projectTypeNames = _.keys(ProjectTypes).toString().split(',').join(', ');

module.exports = {
	'command': 'init [name] [domain] [type] [path]',
	'description': 'Initializes a new project. Valid type values are: ' + projectTypeNames,
	'action': function (name, domain, type, path, program) {
		// Remove all invalid characters from name
		name = name.replace(/[^a-zA-Z0-9\-\.]/gim, '');

		// Set the default type
		type = type || 'static';

		// If the type specified isn't valid, error out
		if (!ProjectTypes[type]) {
			Utility.Handlers.error(util.format('Unknown type "%s"', type));
		}

		// Fix the path
		if (!program) {
			path = null;
		}

		path = nodePath.resolve(process.cwd(), path || '');

		try {
			var trunkName = util.format('trunk/%s', name),
				dbPath = nodePath.resolve(path, 'db'),
				docsPath = nodePath.resolve(path, 'docs'),
				frontendPath = nodePath.resolve(path, trunkName + '.Frontend'),
				prototypePath = nodePath.resolve(path, trunkName + '.Prototype'),
				websitePath = nodePath.resolve(path, trunkName + '.Website'),
				frontendTemplatePath = nodePath.resolve(__dirname, '../../templates/frontend'),
				docsTemplatePath = nodePath.resolve(__dirname, '../../templates/docs');

			// Create the project directories
			Utility.Logging.info('Creating project directories');
			fse.mkdirsSync(dbPath);
			fse.mkdirsSync(docsPath);
			fse.mkdirsSync(prototypePath);
			fse.mkdirsSync(frontendPath);
			fse.mkdirsSync(websitePath);

			// Create the repository in BitBucket
			Utility.Logging.info(util.format('Creating Git repository named %s in BitBucket', domain));
			Utility.BitBucket.createRepository(domain, function (err, res, body) {
				Utility.Handlers.error(err);

				//Utility.Logging.info(res);
				//Utility.Logging.info(body);

				// Copy docs template files to the docs directory
				Utility.Logging.info('Copying docs files');
				fse.copy(docsTemplatePath, docsPath, function (err) {
					Utility.Handlers.error(err);

					// Copy frontend template files to the frontend project directory
					Utility.Logging.info('Copying frontend files');
					fse.copy(frontendTemplatePath, frontendPath, function (err) {
						Utility.Handlers.error(err);

						// Install the npm modules into the frontend path
						Utility.Logging.info('Installing frontend npm modules');
						Utility.NPM.install(frontendPath, function (err) {
							Utility.Handlers.error(err);

							// Duplicate the frontend directory to the prototype directory
							Utility.Logging.info('Copying prototype files');
							fse.copy(frontendPath, prototypePath, function (err) {
								Utility.Handlers.error(err);

								// Execute the template's associated function
								ProjectTypes[type](name, websitePath, function (err) {
									Utility.Handlers.error(err);

									// Initialize the Git repository and push changes to BitBucket
									Utility.Git.init(path, domain, function () {
										Utility.Handlers.error(err);
									});
								});
							});
						});
					});
				});
			});
		} catch (err) {
			Utility.Handlers.error(err);
		}
	}
};