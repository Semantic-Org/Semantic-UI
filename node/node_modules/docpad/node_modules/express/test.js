var express = require('./');
var app = express();

express.request.toJSON = function(){
  return {
    method: this.method,
    url: this.url,
    header: this.headers
  }
};

app.get('*', function(req, res){
  console.log(JSON.stringify(req));
  res.send(200);
});

app.listen(4000)
