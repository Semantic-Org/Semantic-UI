/*!
 * node-progress
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Expose `ProgressBar`.
 */

exports = module.exports = ProgressBar;

/**
 * Library version.
 */

exports.version = '0.1.0';

/**
 * Initialize a `ProgressBar` with the given
 * `fmt` string and `options`.
 *
 * Options:
 *
 *   - `total` total number of ticks to complete
 *   - `stream` the output stream defaulting to stdout
 *   - `complete` completion character defaulting to "="
 *   - `incomplete` incomplete character defaulting to "-"
 *
 * Tokens:
 *
 *   - `:bar` the progress bar itself
 *   - `:current` current tick number
 *   - `:total` total ticks
 *   - `:elapsed` time elapsed in seconds
 *   - `:percent` completion percentage
 *   - `:eta` eta in seconds
 *
 * @param {String} fmt
 * @param {Object} options
 * @api public
 */

function ProgressBar(fmt, options) {
  this.rl = require('readline').createInterface({
    input: process.stdin,
    output: options.stream || process.stdout
  });
  this.rl.setPrompt('', 0);

  options = options || {};
  if ('string' != typeof fmt) throw new Error('format required');
  if ('number' != typeof options.total) throw new Error('total required');
  this.fmt = fmt;
  this.curr = 0;
  this.total = options.total;
  this.width = options.width || this.total;
  this.chars = {
      complete: options.complete || '='
    , incomplete: options.incomplete || '-'
  };
}

/**
 * "tick" the progress bar with optional `len` and
 * optional `tokens`.
 *
 * @param {Number|Object} len or tokens
 * @param {Object} tokens
 * @api public
 */

ProgressBar.prototype.tick = function(len, tokens){
  if (len !== 0)
    len = len || 1;

  // swap tokens
  if ('object' == typeof len) tokens = len, len = 1;

  // start time for eta
  if (0 == this.curr) this.start = new Date;

  // progress complete
  if ((this.curr += len) > this.total) {
    this.complete = true;
    //this.rl.write(null, {ctrl: true, name: 'u'});
    this.rl.resume();
    this.rl.close();
    return;
  }

  var percent = this.curr / this.total * 100
    , complete = Math.round(this.width * (this.curr / this.total))
    , incomplete
    , elapsed = new Date - this.start
    , eta = elapsed * (this.total / this.curr - 1)
  complete = Array(complete).join(this.chars.complete);
  incomplete = Array(this.width - complete.length).join(this.chars.incomplete);

  var str = this.fmt
    .replace(':bar', complete + incomplete)
    .replace(':current', this.curr)
    .replace(':total', this.total)
    .replace(':elapsed', (elapsed / 1000).toFixed(1))
    .replace(':eta', (eta / 1000).toFixed(1))
    .replace(':percent', percent.toFixed(0) + '%');

  if (tokens) {
    for (var key in tokens) {
      str = str.replace(':' + key, tokens[key]);
    }
  }

  this.rl.write(null, {ctrl: true, name: 'u'});
  this.rl.write(str);
};
