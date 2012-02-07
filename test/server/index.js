var restify = require('restify'),
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

server.put('/test', function(req, res) {
    res.send(req.body);
});
    
server.listen(3000);