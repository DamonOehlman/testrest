var fs = require('fs');
var path = require('path');
var server = require('http').createServer();
var app = require('firetruck')(server);

app('/').text('Hi');

app('/json-test').json({
  first: 'Roger',
  last: 'Rabbit'
});

app('/empty').json([]);

app('/test.txt')
  .text(function (req, res) {
    fs.readFile(path.resolve(__dirname, '..', 'data', 'test.txt'), 'utf8', function(err, data) {
        res.end(data);
    });
  });
// .methods('GET');

app('/test')
  .json(function(req, res) {
    req.on('json', function(obj) {
      res.end(obj);
    });
  });
  //   .methods('PUT');

module.exports = app.server;
