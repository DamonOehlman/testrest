var tako = require('tako')
  , fs = require('fs')
  , path = require('path')
  , _ = require('underscore')
  , Cookies = require('cookies')
  , app = tako();

app.route('/echo-headers').json(function(req, res) {
  res.end(JSON.stringify(req.headers));
});

app.route('/echo-cookies').json(function(req, res) {
  var cookies = new Cookies(req, res);
  
  res.end(JSON.stringify({ foo: cookies.get('foo') }));
});

module.exports = app.httpServer;