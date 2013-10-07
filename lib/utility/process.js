'use strict';

var Logging = require('./logging'),
	Promise = require('bluebird'),
	Module = function () {
	};

Module.sleep = function (duration) {
	var resolver = Promise.pending();

	Logging.info('Sleep for ' + duration + ' ms');

	setTimeout(function () {
		Logging.info('Sleep completed');

		resolver.fulfill();
	}, duration);

	return resolver.promise;
};

module.exports = Module;