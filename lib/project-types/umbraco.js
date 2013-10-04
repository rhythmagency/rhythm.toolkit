'use strict';

var Utility = require('../utility'),
	config = require('../../config.json'),
	nodePath = require('path'),
	fse = require('fs-extra'),
	pathe = require('path-extra'),
	fs = require('fs'),
	md5 = require('MD5');

module.exports = function (name, path, callback) {
	var templatePath = nodePath.resolve(__dirname, '../../templates/umbraco'),
		umbracoZipPath = pathe.datadir('rtk/umbraco/' + md5(config.umbraco) + '.zip');

	// Create directory where we store umbraco zip files
	fse.mkdirsSync(nodePath.dirname(umbracoZipPath));

	fse.copy(templatePath, path, function (err) {
		Utility.Handlers.error(err);

		/*
		 Find and replace all instances of 'RHYTHM' in the
		 directory names, file names, and file contents
		 */
		Utility.FileSystem.findAndReplace(path, 'RHYTHM', name);

		// Create the directory we'll store umbraco in if it doesn't exist
		Utility.Logging.info('Creating umbraco project directory');
		var websitePath = nodePath.resolve(path, name + '.Website');
		fse.mkdirsSync(websitePath);

		var extractUmbraco = function (zipFile, websitePath, callback) {
			/*
			 Wait for 1 second before trying to extract to
			 ensure the file is fully downloaded
			 */
			setTimeout((function () {
				// Extracting umbraco to our newly created directory
				Utility.Logging.info('Extracting umbraco');

				Utility.Compression.extract(zipFile, websitePath);

				if (callback) {
					callback(err);
				}
			}), 1000);
		};

		if(fs.existsSync(umbracoZipPath)) {
			extractUmbraco(umbracoZipPath, websitePath, callback);
		} else {
			// Download umbraco
			Utility.Logging.info('Downloading umbraco from ' + config.umbraco);
			Utility.Net.download(config.umbraco, umbracoZipPath, function (err) {
				Utility.Handlers.error(err);

				extractUmbraco(umbracoZipPath, websitePath, callback);
			});
		}

		/*
		// Download and extract umbraco to our newly created directory
		Utility.Logging.info('Downloading and extracting umbraco from ' + config.umbraco);
		Utility.Net.downloadToTempDirectoryAndUnzip(config.umbraco, websitePath, function (err) {
			if (callback) {
				callback(err);
			}
		});
		*/
	});
};