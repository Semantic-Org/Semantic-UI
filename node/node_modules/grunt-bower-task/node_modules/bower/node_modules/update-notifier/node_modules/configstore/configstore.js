'use strict';
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var mkdirp = require('mkdirp');
var YAML = require('yamljs');

var configDir = process.env.XDG_CONFIG_HOME ||
	path.join(process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'],
		'.config');


function readFile(filePath) {
	try {
		return fs.readFileSync(filePath, 'utf8');
	} catch (err) {
		// Create dir if it doesn't exist
		if (err.code === 'ENOENT') {
			mkdirp.sync(path.dirname(filePath));
			return '';
		}

		// Rethrow the error
		throw err;
	}
}

function Configstore(id, defaults) {
	this.path = path.join(configDir, 'configstore', id + '.yml');
	this.all = _.extend({}, defaults, this.all);
}

Configstore.prototype = Object.create(Object.prototype, {
	all: {
		get: function () {
			return YAML.parse(readFile(this.path)) || {};
		},
		set: function (val) {
			fs.writeFileSync(this.path, YAML.stringify(val));
		}
	},
	size: {
		get: function () {
			return _.size(this.all);
		}
	}
});

Configstore.prototype.get = function (key) {
	return this.all[key];
};

Configstore.prototype.set = function (key, val) {
	var config = this.all;
	config[key] = val;
	this.all = config;
};

Configstore.prototype.del = function (key) {
	var config = this.all;
	delete config[key];
	this.all = config;
};

module.exports = Configstore;
