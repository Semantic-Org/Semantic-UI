/*
 * syslog-config.js: Config that conform to syslog logging levels. 
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 *
 */
 
var syslogConfig = exports;

syslogConfig.levels = {
  debug: 0, 
  info: 1, 
  notice: 2, 
  warning: 3,
  error: 4, 
  crit: 5,
  alert: 6,
  emerg: 7
};

syslogConfig.colors = {
  debug: 'blue',
  info: 'green',
  notice: 'yellow',
  warning: 'red',
  error: 'red', 
  crit: 'red',
  alert: 'yellow',
  emerg: 'red'
};