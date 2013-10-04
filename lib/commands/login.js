'use strict';

var Utility = require('../utility');

module.exports = {
	'command': 'login [user] [pass]',
	'description': 'Stores your BitBucket credentials locally.',
	'action': function (user, pass) {
		Utility.Settings.save({
			'bitbucket': {
				'username': user,
				'password': pass
			}
		});
	}
};