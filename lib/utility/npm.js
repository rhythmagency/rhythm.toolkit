'use strict';

var npm = require('npm'),
	Module = function () {
	};

Module.install = function (path, callback) {
	npm.load({'loglevel': 'silent'},
		function (err) {
			if (err) {
				callback(err);
				return;
			}

			npm.commands.install(path, [], function (err, data) {
				if (callback) {
					callback(err, data);
					return;
				}
			});
		});
};

module.exports = Module;