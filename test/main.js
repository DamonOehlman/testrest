var testrest = require('../'),
    server = require('./server');
    
describe('testREST functionality tests', function() {
    describe('GET tests', testrest('get'));
    describe('PUT tests', testrest('put'));
})