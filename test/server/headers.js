var server = module.exports = require('http').createServer();
var app = require('firetruck')(server);
var Cookies = require('cookies');

app('/echo-headers').json(function(req, res) {
  res.end(JSON.stringify(req.headers));
});

app('/echo-cookies').json(function(req, res) {
  var cookies = new Cookies(req, res);

  res.end(JSON.stringify({ foo: cookies.get('foo') }));
});
