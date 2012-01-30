var restify = require('restify'),
    server = restify.createServer(),
    testrest = require('../');
    
function _initServer(done) {
    server.get('/', function(req, res) {
        res.send('Hi');
    });
};

_initServer();

describe('GET tests', testrest('simple-get'));