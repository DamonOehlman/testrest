var testrest = require('../'),
    server = require('./server');
    
describe('testREST functionality tests', function() {
    describe('GET tests', testrest('get', {
        before: server.listen.bind(server, 3000),
        after: server.close.bind(server)
    }));
    
    
    describe('PUT tests', testrest('put', {
        before: server.listen.bind(server, 3000),
        after: server.close.bind(server)
    }));
})