/*
 * grunt-file-regex-rename
 * http://www.kashiif.com/
 *
 * Copyright (c) 2012 Kashif Iqbal Khan
 * Licensed under the MIT license.
 * https://github.com/kashiif/grunt-file-regex-rename/blob/master/LICENSE-MIT
 *
 * Modified by Michael Lawrence <michael.lawrence@rhythmagency.com>
 */

module.exports = function (grunt) {
	'use strict';

	var fs = require('fs'),
		path = require('path');

	grunt.registerMultiTask('fileregexrename-mod', 'Rename files/folders matching regex pattern.', function () {

		// Merging options with defaults
		var options = this.options({
			replacements: []
		});

		if (!this.files) {
			return;
		}

		function multi_str_replace(string, replacements) {
			return replacements.reduce(function (str, pair) {
				return str.replace(pair.pattern, pair.replacement);
			}, string);
		};

		this.files.forEach(function (f) {
			f.src.reverse(); // Modified by Michael Lawrence <michael.lawrence@rhythmagency.com>
			f.src.forEach(function (src) {
				var filename = path.basename(src),
					renamed = multi_str_replace(filename, options.replacements);

				// Renaming the file
				if (filename != renamed) {
					var destDir = path.dirname(f.dest);

					// Modified by Michael Lawrence <michael.lawrence@rhythmagency.com>
					try {
						fs.renameSync(src, path.resolve(path.dirname(src), renamed));
					} catch (ex) {
						grunt.file.copy(src, path.resolve(destDir, renamed));
					}

					grunt.log.write(src + ' ').ok(renamed);
				}
			});
		});
	});
};