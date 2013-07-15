var Node = require('./node')
  , nodes = require('./');

var MozDocument = module.exports = function MozDocument(val){
  Node.call(this);
  this.val = val;
};

MozDocument.prototype.__proto__ = Node.prototype;

MozDocument.prototype.clone = function(){
  var clone = new MozDocument(this.val);
  clone.block = this.block.clone();
  return clone;
};

MozDocument.prototype.toString = function(){
  return '@-moz-document ' + this.val;
}
