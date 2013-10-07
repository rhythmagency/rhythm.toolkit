'use strict';

var Promise = require('bluebird'),
	Crypto = require('./crypto'),
	Settings = require('./settings'),
	util = require('util'),
	post = Promise.promisify(require('request').post),
	config = require('../../config.json'),
	Module = function () {
	};

Module.apiEndpoint = 'https://bitbucket.org/api/1.0/';

Module.createRepository = function (name) {
	var settings = Settings.get();

	if (settings && settings.bitbucket && settings.bitbucket.username && settings.bitbucket.password) {
		// TODO: Add logic to handle failure of creating repository. Possibly due to invalid credentials.
		return post({
			'uri': util.format('%srepositories', Module.apiEndpoint),
			'auth': {
				'user': Crypto.decrypt(settings.bitbucket.username),
				'pass': Crypto.decrypt(settings.bitbucket.password)
			},
			'form': {
				'name': name,
				'description': util.format(config.bitbucket.description, name),
				'is_private': config.bitbucket.is_private,
				'scm': config.bitbucket.scm,
				'owner': config.bitbucket.owner
			}
		});
	} else {
		return Promise.rejected('Invalid settings file. Please use login first.');
	}
};

/*
// TODO: Revisit this when it actually works on BitBucket's end. Requires repo owner to delete, not admin for some reason.

Module.deleteRepository = function (name, callback) {
	var settings = Settings.get();

	if (settings && settings.bitbucket && settings.bitbucket.username && settings.bitbucket.password) {
		var options = {
			'uri': util.format('%srepositories/%s/%s', Module.apiEndpoint, config.bitbucket.owner, name),
			'auth': {
				'user': Crypto.decrypt(settings.bitbucket.username),
				'pass': Crypto.decrypt(settings.bitbucket.password)
			},
			'form': {

			}
		};

		// TODO: Add logic to handle failure of deleting repository. Possibly due to invalid credentials.
		request.del(options, callback);
	} else {
		callback('Invalid settings file. Please use login first.');
	}
}
*/

module.exports = Module;