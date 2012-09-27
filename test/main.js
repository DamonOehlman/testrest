var testrest = require('../');
  
describe('GET tests', testrest('get', {
  server: require('./server')
}));

/*
describe('GET tests', testrest('get.txt'));
    
describe('testREST functionality tests', function() {
    describe('GET tests', function() {
        
    });
    
    describe('GET tests', testrest('get', opts));
    describe('GET tests (failure conditions)', testrest('get.fails', opts));
    describe('PUT tests', testrest('put', opts));
})
*/