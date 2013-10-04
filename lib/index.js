'use strict';

var util = require('util'),
	program = require('commander'),
	pkg = require('../package.json'),
	commands = require('./commands');

program.version(pkg.version);

for (var i in commands) {
	var command = commands[i],
		programCommand = program
			.command(command.command);

	if(command.options && command.options.length) {
		for(var i in command.options) {
			var option = command.options[i];

			programCommand = programCommand.option(option.option, option.description);
		}
	}

	programCommand
		.description(command.description)
		.action(command.action);
}

program
	.command('*')
	.action(program.help);

program.parse(process.argv);

if (program.args.length < 1) {
	program.help();
}