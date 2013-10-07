'use strict';

var Promise = require('bluebird'),
	AdmZip = require('adm-zip'),
	Module = function () {
	};

Module.extract = function (zipFile, path) {
	var zip = new AdmZip(zipFile);
	zip.extractAllTo(path, true);
	return Promise.fulfilled();
};

module.exports = Module;