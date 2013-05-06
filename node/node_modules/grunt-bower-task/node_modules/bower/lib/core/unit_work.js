// ==========================================
// BOWER: Package Object Definition
// ==========================================
// Copyright 2012 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================
// Events:
//  - lock: fired when a lock write over a key is acquired
//  - unlock: fired when an unlock write over a key is acquired
// ==========================================

var events   = require('events');

var UnitWork = function () {
  this.locks = [];
  this.data = [];

  this.setMaxListeners(100);   // Increase the number of listeners because this is a central storage
};

UnitWork.prototype = Object.create(events.EventEmitter.prototype);

UnitWork.prototype.constructor = UnitWork;

UnitWork.prototype.lock = function (key, owner) {
  if (this.locks[key]) throw new Error('A write lock for "' + key + '" was already acquired.');
  if (!owner) throw new Error('A lock requires an owner.');
  this.locks[key] = owner;

  return this.emit('lock', key);
};

UnitWork.prototype.unlock = function (key, owner) {
  if (!owner) throw new Error('A write lock requires an owner.');
  if (this.locks[key]) {
    if (this.locks[key] !== owner) throw new Error('Lock owner for  "' + key + '" mismatch.');
    delete this.locks[key];
    this.emit('unlock', key);
  }

  return this;
};

UnitWork.prototype.isLocked = function (key) {
  return !!this.locks[key];
};

UnitWork.prototype.store = function (key, data, owner) {
  if (this.locks[key] && owner !== this.locks[key]) throw new Error('A write lock for "' + key + '" is acquired therefore only its owner can write to it.');
  this.data[key] = data;

  return this;
};

UnitWork.prototype.retrieve = function (key) {
  return this.data[key];
};

UnitWork.prototype.keys = function () {
  return Object.keys(this.data);
};

module.exports = UnitWork;