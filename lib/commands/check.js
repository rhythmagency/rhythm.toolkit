'use strict';

// TODO: Actually check the rhythm.toolkit npm package to see if the current version is the latest.

var npm = require('npm');

module.exports = {
	'command': 'check',
	'description': 'Checks for updates to rhythm.toolkit.',
	'action': function () {
		console.log('CHECK');

		npm.load({}, function (err) {
			if (err) {
				console.log(err);
			}

			npm.commands.search(['jquery-browser'], function (err, data) {
				if (err) {
					console.log(err);
				} else {
					console.log(data);
				}
			});

			npm.on('log', function (message) {
				console.log('[NPM]', message);
			})
		});
	}
};