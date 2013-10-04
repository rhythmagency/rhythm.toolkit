'use strict';

var _ = require('underscore'),
	Crypto = require('./crypto'),
	Logging = require('./logging'),
	pathe = require('path-extra'),
	fs = require('fs'),
	fse = require('fs-extra'),
	Module = function () {
	};

Module.settingsPath = pathe.datadir('rtk/settings.json');

Module.settingsTemplate = {
	'bitbucket': {
		'username': '',
		'password': ''
	}
};

Module.save = function (settings) {
	settings = _.defaults(settings, Module.settingsTemplate);

	// Encrypt the username and password
	settings.bitbucket.username = Crypto.encrypt(settings.bitbucket.username);
	settings.bitbucket.password = Crypto.encrypt(settings.bitbucket.password);

	fse.outputJsonSync(Module.settingsPath, settings);
	Logging.info('Settings saved');
};

Module.get = function () {
	return Module.exists() ? _.defaults(fse.readJsonSync(Module.settingsPath), Module.settingsTemplate) : null;
};

Module.exists = function () {
	return fs.existsSync(Module.settingsPath);
};

module.exports = Module;