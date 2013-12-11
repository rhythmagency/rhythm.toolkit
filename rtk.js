var path = require('path-extra'),
	spawn = require('child_process').spawn,
	_ = require('lodash'),
	args = _.rest(process.argv, 2);

if (args.length < 1) {
	console.log('Usage: rtk [task] [target]');
	console.log('');
	console.log('Tasks:');

	['frontend [projectname]', 'umbraco [projectname]', 'build', 'watch'].sort().forEach(function (task) {
		console.log('*', task);
	});

	return;
} else if (!args[0]) {
	console.log('[ERROR] Task cannot be null/blank.');
	return;
} else if ((args[0] === 'umbraco' || args[0] === 'frontend') && ((args.length > 1 && !args[1]) || args.length < 2)) {
	console.log('[ERROR] Project name cannot be null/blank.');
	return;
}

var task = args[0],
	name = args[1],
	target = args[2] || process.cwd();

var gruntProc = spawn('grunt', [
	'--gruntfile=' + path.join(__dirname, 'Gruntfile.js'),
	'-target=' + target,
	'-name=' + name,
	task
]);

gruntProc.stdout.on('data', function (data) {
	console.log(data.toString());
});

gruntProc.stderr.on('data', function (data) {
	console.log('[ERROR] ' + data);
});

gruntProc.on('close', function (code) {
	if (code !== 0) {
		console.log('process exited with code ' + code);
	}
});