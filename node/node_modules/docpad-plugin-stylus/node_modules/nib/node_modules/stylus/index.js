
module.exports = process.env.STYLUS_COV
  ? require('./lib-cov/stylus')
  : require('./lib/stylus');