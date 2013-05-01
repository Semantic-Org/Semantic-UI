'use strict';

var defineProperty = Object.defineProperty
  , copy           = require('es5-ext/lib/Array/prototype/copy')
  , remove         = require('es5-ext/lib/Array/prototype/remove')
  , d              = require('es5-ext/lib/Object/descriptor')
  , value          = require('es5-ext/lib/Object/valid-value')
  , emit           = require('./core').methods.emit

  , id = '- ee -'
  , pipeTag = '\u0001pipes';

module.exports = function (emitter1, emitter2) {
	var pipes, pipe;

	value(emitter1) && value(emitter2);
	if (!emitter1.emit) {
		throw new TypeError(emitter1 + ' is not emitter');
	}

	pipe = {
		close: function () {
			remove.call(pipes, emitter2);
		}
	};
	if (!emitter1.hasOwnProperty(id)) {
		defineProperty(emitter1, id, d({}));
	}
	if (emitter1[id][pipeTag]) {
		(pipes = emitter1[id][pipeTag]).push(emitter2);
		return pipe;
	}
	(pipes = emitter1[id][pipeTag] = [emitter2]).copy = copy;
	defineProperty(emitter1, 'emit', d(function () {
		var i, emitter, data = pipes.copy();
		emit.apply(this, arguments);
		for (i = 0; (emitter = data[i]); ++i) {
			emit.apply(emitter, arguments);
		}
	}));

	return pipe;
};
