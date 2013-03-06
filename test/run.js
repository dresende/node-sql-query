var options = {};

if (process.env.FILTER) {
	options.include = new RegExp(process.env.FILTER + '.*\\.js$');
}

process.stdout.write("\033[1;34m[i] \033[0;34mTesting \033[1;34msql-query\033[0m\n");

require('urun')(__dirname, options);
