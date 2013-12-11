var $ = window.$ = window.jQuery = require('jquery-browser/lib/jquery'),
	tplHBS = require('./templates/test.hbs'),
	tplJade = require('./templates/test.jade');

$(function () {
	console.log('READY');
	console.log('Test');
	tplHBS({'name': 'Test Name'});
	tplJade({'name': 'Test Name 2'});
});