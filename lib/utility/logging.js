'use strict';

var colors = require('colors'),
	Module = function () {
	};

Module.log = function (message, type) {
	var defaultType = 'info';

	type = type || defaultType;

	if (!Module[type]) {
		type = defaultType;
	}

	Module[type](message);
};

Module.info = function (message) {
	console.log('[INFO]'.blue, message);
};

Module.error = function (message) {
	console.error('[ERROR]'.red, message);
};

module.exports = Module;