'use strict';

var Logging = require('./logging'),
	Promise = require('bluebird'),
	AdmZip = require('adm-zip'),
	util = require('util'),
	Module = function () {
	};

Module.extract = function (zipFile, path) {
	try {
		Logging.info(util.format('Extracting %s to %s', zipFile, path));

		var zip = new AdmZip(zipFile);
		zip.extractAllTo(path, true);
		return Promise.fulfilled();
	} catch (e) {
		Logging.error(util.format('Error extracting %s to %s', zipFile, path));

		return Promise.rejected(e);
	}
};

module.exports = Module;