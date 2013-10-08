'use strict';

var Promise = require('bluebird'),
	Utility = require('../utility'),
	config = require('../../config.json'),
	nodePath = require('path'),
	fse = Promise.promisify(require('fs-extra')),
	pathe = require('path-extra'),
	fs = require('fs'),
	md5 = require('MD5');

module.exports = function (name, path) {
	var templatePath = nodePath.resolve(__dirname, '../../templates/umbraco'),
		umbracoZipPath = pathe.datadir('rtk/umbraco/' + md5(config.umbraco) + '.zip'),
		websitePath = nodePath.resolve(path, name + '.Website');

	return fse.mkdirsAsync(nodePath.dirname(umbracoZipPath))
		.then(function () {
			return fse.copyAsync(templatePath, path);
		})
		.then(function () {
			/*
			 Find and replace all instances of 'RHYTHM' in the
			 directory names, file names, and file contents
			 */
			Utility.FileSystem.findAndReplace(path, 'RHYTHM', name);

			// Create the directory we'll store umbraco in if it doesn't exist
			Utility.Logging.info('Creating umbraco project directory');
			return fse.mkdirsAsync(websitePath);
		})
		.then(function () {
			if (fs.existsSync(umbracoZipPath)) {
				return Promise.fulfilled();
			} else {
				// Download umbraco
				Utility.Logging.info('Downloading umbraco from ' + config.umbraco);
				return Utility.Net.download(config.umbraco, umbracoZipPath);
			}
		})
		.then(function () {
			// Wait for 1 second before trying to extract to ensure the file is fully downloaded
			return Utility.Process.sleep(1000);
		})
		.then(function () {
			// Extracting umbraco to our newly created directory
			Utility.Logging.info('Extracting umbraco');
			return Utility.Compression.extract(umbracoZipPath, websitePath);
		})
		.then(function () {
			// Create .gitkeep files
			Utility.Logging.info('Creating .gitkeep files');
			return Utility.FileSystem.createGitKeepFiles(websitePath);
		})
		.catch(function (e) {
			Logging.error(e);
		});
};