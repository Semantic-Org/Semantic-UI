var connect = require('./');

var app = connect();

app.use(connect.responseTime());
app.use(connect.cookieParser());
app.use(connect.session({ secret: 'hey' }));

app.use(function(req, res, next){
  console.log(req.session);
  if ('/' == req.url) {
    req.session.destroy(function(){
      res.statusCode = 302;
      res.setHeader('Location', '/login');
      res.end('redirecting');
    });
  } else {
    res.end('login');
  }
});

app.listen(3000);