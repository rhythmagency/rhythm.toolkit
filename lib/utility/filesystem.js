'use strict';

var fs = require('fs'),
	file = require('file'),
	nodePath = require('path'),
	Module = function () {
	};

Module.findAndReplaceInFile = function (path, searchValue, newValue) {
	var data = fs.readFileSync(path, 'utf8'),
		result = data.replace(new RegExp(searchValue, 'g'), newValue);

	fs.writeFileSync(path, result, 'utf8');
};

Module.findAndReplace = function (path, searchValue, newValue) {
	var items = [];

	file.walkSync(path, function (dirPath, dirs, files) {
		var oldDirName = nodePath.basename(dirPath);

		// Check to see if the directory need to be renamed
		if (oldDirName.indexOf(searchValue) >= 0) {
			var newDirName = oldDirName.replace(new RegExp(searchValue, 'g'), newValue),
				newDirPath = nodePath.resolve(dirPath, '..', newDirName);

			// Store the items to be renamed so we can sort and rename them later
			items.push({
				'from': dirPath,
				'to': newDirPath
			});
		}

		// Now iterate across the files and store them so we can rename them later
		for (var i in files) {
			var fileName = files[i],
				filePath = nodePath.resolve(dirPath, fileName);

			// Check to see if the file needs to be renamed
			if (fileName.indexOf(searchValue) >= 0) {
				var newFileName = fileName.replace(new RegExp(searchValue, 'g'), newValue),
					newFilePath = nodePath.resolve(dirPath, newFileName);

				// Store the items to be renamed so we can sort and rename them later
				items.push({
					'from': filePath,
					'to': newFilePath
				});
			}

			// Check to see if the contents of the file needs to be updated
			Module.findAndReplaceInFile(filePath, searchValue, newValue);
		}
	});

	// Reverse the array so that we don't get errors when renaming parent directories
	items.reverse();

	// Loop through all of the items and rename them
	for (var i in items) {
		var item = items[i];
		fs.renameSync(item.from, item.to);
	}
};

module.exports = Module;