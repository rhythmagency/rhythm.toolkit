'use strict';

module.exports = function (name, path, callback) {
	// Do nothing since static sites only need the Frontend and Prototype project folders.
	if (callback) {
		callback();
	}
};