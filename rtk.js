try {
	var path = require('path-extra'),
		spawn = require('child_process').spawn,
		_ = require('underscore'),
		args = _.rest(process.argv, 2);

	if (args.length < 1) {
		console.log('Usage: rtk [task] [target]');
		console.log('');
		console.log('Tasks:');

		['login:[account]:[user]:[pass]', 'frontend [projectname] [domain]', 'umbraco [projectname] [domain]'].forEach(function (task) {
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
		domain = args[2],
		target = args[3] || process.cwd(),
		procArgs = ['--gruntfile=' + path.join(__dirname, 'Gruntfile.js')];

	if (target) {
		procArgs.push('-target=' + target);
	}

	if (name) {
		procArgs.push('-name=' + name);
	}

	if (domain) {
		procArgs.push('-domain=' + domain);
	}

	//procArgs.push('--verbose');
	procArgs.push(task);

	var gruntPath = 'grunt';

	// If launching from windows we need to add .cmd to the path.
	if (!!process.platform.match(/^win/)) {
		gruntPath += '.cmd';
	}

	var gruntProc = spawn(gruntPath, procArgs);

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

	process.on('uncaughtException', function (err) {
		console.error(err.stack);
	});
} catch (err) {
	console.error(err);
}