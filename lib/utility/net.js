'use strict';

var Promise = require('bluebird'),
	Process = require('./process'),
	Compression = require('./compression'),
	request = Promise.promisify(require('request')),
	fs = require('fs'),
	temp = Promise.promisify(require('temp')),
	uuid = require('node-uuid'),
	nodePath = require('path'),
	Module = function () {
	};

Module.download = function (url, path) {
	return request(url).pipe(fs.createWriteStream(path));
};

Module.downloadToTempDirectory = function (url) {
	temp.track();

	return temp.mkdirAsync(uuid.v1())
		.then(function () {
			return Module.download(url, nodePath.join(dirPath, uuid.v1()));
		});
};

Module.downloadToTempDirectoryAndUnzip = function (url, path) {
	return Module.downloadToTempDirectory(url)
		.then(function () {
			// Wait for 1 second before trying to extract to ensure the file is fully downloaded
			return Process.sleep(1000);
		})
		.then(function () {
			return Compression.extract(filePath, path);
		});
};

module.exports = Module;