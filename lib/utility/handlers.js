'use strict';

var Logging = require('./logging'),
	Module = function () {
	};

Module.error = function (err) {
	if (err) {
		Logging.error(err);
		process.exit(1);
	}
};

module.exports = Module;