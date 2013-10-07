'use strict';

var _ = require('underscore'),
	Promise = require('bluebird'),
	Utility = require('../utility'),
	ProjectTypes = require('../project-types'),
	fse = Promise.promisify(require('fs-extra')),
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

		var trunkName = util.format('trunk/%s', name),
			dbPath = nodePath.resolve(path, 'db'),
			docsPath = nodePath.resolve(path, 'docs'),
			frontendPath = nodePath.resolve(path, trunkName + '.Frontend'),
			prototypePath = nodePath.resolve(path, trunkName + '.Prototype'),
			websitePath = nodePath.resolve(path, trunkName + '.Website'),
			frontendTemplatePath = nodePath.resolve(__dirname, '../../templates/frontend'),
			docsTemplatePath = nodePath.resolve(__dirname, '../../templates/docs');

		// Create the various project directories
		Utility.Logging.info('Creating project directories');
		fse.mkdirsSync(dbPath);
		fse.mkdirsSync(docsPath);
		fse.mkdirsSync(prototypePath);
		fse.mkdirsSync(frontendPath);
		fse.mkdirsSync(websitePath);

		// Create the repository in BitBucket
		Utility.Logging.info(util.format('Creating Git repository named %s in BitBucket', domain));
		Utility.BitBucket.createRepository(domain)
			// Copy docs template files to the docs directory
			.then(function () {
				Utility.Logging.info('Copying docs files');
				return fse.copyAsync(docsTemplatePath, docsPath);
			})
			// Copy frontend template files to the frontend project directory
			.then(function () {
				Utility.Logging.info('Copying frontend files');
				return fse.copyAsync(frontendTemplatePath, frontendPath);
			})
			// Install the npm modules into the frontend path
			.then(function () {
				Utility.Logging.info('Installing frontend npm modules');
				return Utility.NPM.install(frontendPath);
			})
			// Duplicate the frontend directory to the prototype directory
			.then(function () {
				Utility.Logging.info('Copying prototype files');
				return fse.copyAsync(frontendPath, prototypePath);
			})
			// Execute the template's associated function
			.then(function () {
				Utility.Logging.info(util.format('Running %s command', type));
				return ProjectTypes[type](name, websitePath);
			})
			// Initialize the Git repository and push changes to BitBucket
			.then(function () {
				Utility.Logging.info('Running Git initialization script');
				return Utility.Git.init(path, domain);
			})
			// Catch all errors, log them, then exit the process
			.catch(function (e) {
				Utility.Handlers.error(e.stack);
			});
	}
};