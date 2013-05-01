/*
 * cli-config.js: Config that conform to commonly used CLI logging levels. 
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 *
 */
 
var cliConfig = exports;

cliConfig.levels = {
  silly: 0,
  input: 1,
  verbose: 2,
  prompt: 3,
  info: 4,
  data: 5,
  help: 6,
  warn: 7,
  debug: 8,
  error: 9
};

cliConfig.colors = {
  silly: 'magenta',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
};