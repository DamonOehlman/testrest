var restify = require('restify'),
    fs = require('fs'),
    path = require('path'),
    server = restify.createServer();
    
server.use(restify.jsonBodyParser({ mapParams: false }));
    
server.get('/', function(req, res) {
    res.send('Hi');
});

server.get('/json-test', function(req, res) {
    res.send({
        first: "Roger",
        last: "Rabbit"
    });
});

server.get('/empty', function(req, res) {
    res.send([]);
});

server.get('/empty-fail', function(req, res) {
    res.send({ error: 'failed' });
});

server.put('/test', function(req, res) {
    res.send(req.body);
});

server.get('/test.txt', function(req, res) {
    fs.readFile(path.resolve(__dirname, 'data', 'test.txt'), 'utf8', function(err, data) {
        res.send(data);
    });
});
    
server.listen(3000);