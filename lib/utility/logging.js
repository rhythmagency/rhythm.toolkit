'use strict';

var Promise = require('bluebird'),
	colors = require('colors'),
	Module = function () {
	};

Module.log = function (message, type) {
	var defaultType = 'info';

	type = type || defaultType;

	if (!Module[type]) {
		type = defaultType;
	}

	Module[type](message);

	return Promise.fulfilled();
};

Module.info = function (message) {
	console.log('[INFO]'.blue, message);
	return Promise.fulfilled();
};

Module.error = function (message) {
	console.error('[ERROR]'.red, message);
	return Promise.fulfilled();
};

module.exports = Module;