'use strict';

var crypto = require('crypto'),
	md5 = require('MD5'),
	config = require('../../config.json'),
	Module = function () {
	};

Module.encrypt = function (text) {
	var cipher = crypto.createCipher(config.crypto.algorithm, config.crypto.password);
	return cipher.update(text, config.crypto.decrypt_encoding, config.crypto.encrypt_encoding) + cipher.final(config.crypto.encrypt_encoding);
};

Module.decrypt = function (text) {
	var decipher = crypto.createDecipher(config.crypto.algorithm, config.crypto.password);
	return decipher.update(text, config.crypto.encrypt_encoding, config.crypto.decrypt_encoding) + decipher.final(config.crypto.decrypt_encoding);
};

Module.md5 = function (text) {
	return md5(text);
};

module.exports = Module;