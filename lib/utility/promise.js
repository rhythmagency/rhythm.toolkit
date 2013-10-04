'use strict';

var Promise = require('bluebird'),
	Module = function () {
	};

Module.promisify = function (func, scope) {
	var resolver = Promise.pending(),
		args = Array.prototype.slice.call(arguments, 2);

	args.push(function (err) {
		if (err) {
			resolver.reject(err);
		} else {
			resolver.fulfill();
		}
	});

	func.apply(scope, args);

	return resolver.promise;
},

	module.exports = Module;