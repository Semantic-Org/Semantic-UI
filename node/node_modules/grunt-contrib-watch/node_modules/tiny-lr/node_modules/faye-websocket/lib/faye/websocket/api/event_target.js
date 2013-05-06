var Event = require('./event');

var EventTarget = {
  onopen:     null,
  onmessage:  null,
  onerror:    null,
  onclose:    null,

  addEventListener: function(eventType, listener, useCapture) {
    this._listeners = this._listeners || {};
    var list = this._listeners[eventType] = this._listeners[eventType] || [];
    list.push(listener);
  },

  removeEventListener: function(eventType, listener, useCapture) {
    if (!this._listeners || !this._listeners[eventType]) return;

    if (!listener) {
      delete this._listeners[eventType];
      return;
    }
    var list = this._listeners[eventType],
        i    = list.length;

    while (i--) {
      if (listener !== list[i]) continue;
      list.splice(i,1);
    }
  },

  dispatchEvent: function(event) {
    event.target = event.currentTarget = this;
    event.eventPhase = Event.AT_TARGET;

    if (this['on' + event.type])
      this['on' + event.type](event);

    if (!this._listeners || !this._listeners[event.type]) return;

    this._listeners[event.type].forEach(function(listener) {
      listener(event);
    }, this);
  }
};

module.exports = EventTarget;

