'use strict';

var Logging = require('./logging'),
	Promise = require('bluebird'),
	Module = function () {
	};

Module.sleep = function (duration) {
	var resolver = Promise.pending();

	setTimeout(function () {
		resolver.fulfill();
	}, duration);

	return resolver.promise;
};

module.exports = Module;