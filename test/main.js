var testrest = require('../'),
    server = require('./server');
    
describe('testREST functionalit tests', function() {
    describe('GET tests', testrest('get'));
    describe('PUT tests', testrest('put'));
})