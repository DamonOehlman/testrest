var restify = require('restify'),
    server = restify.createServer(),
    testrest = require('../');
    
function _initServer(done) {
    server.get('/', function(req, res) {
        res.send('Hi');
    });
    
    server.listen(3000);
};

_initServer();

describe('GET tests', testrest());