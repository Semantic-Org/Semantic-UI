(function () {
	'use strict';

	var inflate = require('../lib/rawinflate.js'),
		deflate = require('../lib/rawdeflate.js'),
		ender = require('ender');

	ender.domReady(function () {	
		ender('#inflated').bind('keyup', function () {
			var self = this, dst = ender('#deflated');

			setTimeout(function(){
				var arr,
					str;

				arr = Array.prototype.map.call(self.value, function (char) {
					return char.charCodeAt(0);
				});

				str = deflate(arr).map(function (byte) {
					return String.fromCharCode(byte);
				}).join('');

				dst.val(btoa(str));
			},0);
		});
		ender('#deflated').bind('keyup', function () {
			var self = this, dst = ender('#inflated');

			setTimeout(function(){
				var str,
					arr;

				arr = Array.prototype.map.call(atob(self.value), function (char) {
					return char.charCodeAt(0);
				});

				str = inflate(arr).map(function (byte) {
					return String.fromCharCode(byte);
				}).join('');
			
				dst.val(str);
			}, 0);
		});
	});
}());
