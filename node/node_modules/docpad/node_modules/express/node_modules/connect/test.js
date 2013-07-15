var crypto = require('crypto')

exports.uid = function(len) {
  return crypto.randomBytes(Math.ceil(len * 3 / 4))
    .toString('hex')
};

console.log(exports.uid(10));
