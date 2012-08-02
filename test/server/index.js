var tako = require('tako'),
    fs = require('fs'),
    path = require('path'),
    app = tako();
    
app.route('/').text('Hi');

app.route('/json-test').json({
    first: 'Roger',
    last: 'Rabbit'
});

app.route('/empty').json([]);

app.route('/empty-fail').json({
    error: 'failed'
});

app.route('/test.txt')
  .text(function (req, res) {
    fs.readFile(path.resolve(__dirname, '..', 'data', 'test.txt'), 'utf8', function(err, data) {
        res.end(data);
    });
  })
  .methods('GET');

app.route('/test')
  .json(function(req, res) {
    req.on('json', function(obj) {
      res.end(obj);
    });
  })
  .methods('PUT');

app.httpServer.listen(3000);