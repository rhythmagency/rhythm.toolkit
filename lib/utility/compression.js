'use strict';

var AdmZip = require('adm-zip'),
	Module = function () {
	};

Module.extract = function (zipFile, path) {
	var zip = new AdmZip(zipFile);
	zip.extractAllTo(path, true);
};

module.exports = Module;