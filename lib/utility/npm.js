'use strict';

var Promise = require('bluebird'),
	npm = require('npm'),
	Module = function () {
	};

Module.install = function (path) {
	var resolver = Promise.pending();

	npm.load({'loglevel': 'silent'},
		function (err) {
			if (err) {
				resolver.reject(err);
			} else {
				npm.commands.install(path, [], function (err, data) {
					if (err) {
						resolver.reject(err);
					} else {
						resolver.fulfill(data);
					}
				});
			}
		});

	return resolver.promise;
};

module.exports = Module;