'use strict';

var Promise = require('bluebird'),
	Process = require('./process'),
	ProgressBar = require('progress'),
	Compression = require('./compression'),
	request = require('request'),
	fs = require('fs'),
	temp = Promise.promisify(require('temp')),
	uuid = require('node-uuid'),
	nodePath = require('path'),
	Module = function () {
	};

Module.download = function (url, path) {
	var resolver = Promise.pending(),
		req = request(url);

	req.on('end', function () {
		resolver.fulfill();
	});

	req.on('error', function (e) {
		resolver.reject(e);
	});

	req.on('response', function (res) {
		var len = parseInt(res.headers['content-length'], 10);

		var bar = new ProgressBar('  downloading [:bar] :percent :etas', {
			'complete': '=',
			'incomplete': ' ',
			'width': 20,
			'total': len
		});

		res.on('data', function (chunk) {
			bar.tick(chunk.length);
		});
	});

	req.pipe(fs.createWriteStream(path));

	return resolver.promise;
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
			return Compression.extract(filePath, path);
		});
};

module.exports = Module;