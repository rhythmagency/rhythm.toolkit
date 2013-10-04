'use strict';

var Compression = require('./compression'),
	request = require('request'),
	fs = require('fs'),
	temp = require('temp'),
	uuid = require('node-uuid'),
	nodePath = require('path'),
	Module = function () {
	};

Module.download = function (url, path, callback) {
	request(url, callback).pipe(fs.createWriteStream(path));
};

Module.downloadToTempDirectory = function (url, callback) {
	temp.track();

	temp.mkdir(uuid.v1(), function (err, dirPath) {
		if (err) {
			if (callback) {
				callback(err);
			}
			return;
		}

		var filePath = nodePath.join(dirPath, uuid.v1());

		Module.download(url, filePath, function (err) {
			if (callback) {
				callback(err, filePath);
			}
		});
	});
};

Module.downloadToTempDirectoryAndUnzip = function (url, path, callback) {
	Module.downloadToTempDirectory(url, function (err, filePath) {
		/*
		 Wait for 1 second before trying to extract to
		 ensure the file is fully downloaded
		 */
		setTimeout((function () {
			Compression.extract(filePath, path);

			if (callback) {
				callback(err);
			}
		}), 1000);
	});
};

module.exports = Module;