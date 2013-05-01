tr = require("traverse")
obj = {"a": "[false]",  "b": "[]", c: "[\"a string\"]"}
o = JSON.parse(JSON.stringify(obj))
tr(o).forEach(function(e){ 
    if (this.isLeaf) { 
         //if (e === "[false]"){ this.update(false) } 
         if (e === "[]") { this.update([]);  }
    }
})
