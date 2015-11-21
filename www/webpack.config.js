var path = require('path');
var s = path.sep;

module.exports = {
	entry: __dirname + s + 'js' + s + 'components' + s + 'build' + s + 'App.js',
	output: {
		filename: __dirname + s + 'js' + s + 'bundle.js',
	},
	resolve: {
		moduleDirectories: [ 'node_modules' ],
	},
}
