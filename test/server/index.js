var restify = require('restify'),
    server = restify.createServer();
    
server.use(restify.jsonBodyParser());
    
server.get('/', function(req, res) {
    res.send('Hi');
});

server.get('/json-test', function(req, res) {
    res.send({ hi: 'there' });
});

server.put('/test', function(req, res) {
    res.send(req.params);
});
    
server.listen(3000);