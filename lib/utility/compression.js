'use strict';

var Promise = require('bluebird'),
	AdmZip = require('adm-zip'),
	Module = function () {
	};

Module.extract = function (zipFile, path) {
	try {
		var zip = new AdmZip(zipFile);
		zip.extractAllTo(path, true);
		return Promise.fulfilled();
	} catch (e) {
		return Promise.rejected(e);
	}
};

module.exports = Module;