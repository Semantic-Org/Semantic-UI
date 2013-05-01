/*
 * device.js: Instance of a single Loggly device
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */
 
var Device = exports.Device = function (client, details) {
  if (!details) throw new Error("Device must be constructed with at least basic details.")

  this.client = client;
  this._setProperties(details);
};

Device.prototype.addToInput = function (inputId, callback) {
  this.client.addDeviceToInput(inputId, this.id, callback);
};
  
//
// Sets the properties for this instance
// Parameters: details
//
Device.prototype._setProperties = function (details) {
  // Copy the properties to this instance
  var self = this;
  Object.keys(details).forEach(function (key) {
    self[key] = details[key];
  });
};