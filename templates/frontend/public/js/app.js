'use strict';

var $,
	_ = require('underscore'),
	// Merge the rhythm constants and the local constants into a single variable
	CONST = _.defaults(
		require('./lib/constants'),
		require('rhythm.framework/lib/constants')
	);

// jQuery
$ = window.$ = window.jQuery = require('jquery-browser/lib/jquery');

// jQuery Plugins
require('rhythm.framework/lib/jquery/jquery.dataAttributeFramework')($);
require('rhythm.framework/lib/jquery/jquery.svgFallback')($);

// Twitter Bootstrap
require('./vendor/bootstrap/transition');
require('./vendor/bootstrap/alert');
require('./vendor/bootstrap/modal');
require('./vendor/bootstrap/dropdown');
require('./vendor/bootstrap/scrollspy');
require('./vendor/bootstrap/tab');
require('./vendor/bootstrap/tooltip');
require('./vendor/bootstrap/popover');
require('./vendor/bootstrap/button');
require('./vendor/bootstrap/collapse');
require('./vendor/bootstrap/carousel');
require('./vendor/bootstrap/affix');

// Initialization
$(function () {
	$.dataAttributeFramework();
	$(CONST.SELECTORS.IMAGE_DATA_FALLBACK).svgFallback();
});