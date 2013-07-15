
module.exports = process.env.JADE_COV
  ? require('./lib-cov/jade')
  : require('./lib/jade');