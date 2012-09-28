var testrest = require('../');

describe('rejection tests', function() {
  describe('yaml control file', testrest('reject', {
    server: require('./server')
  }));
  
  /*
  describe('json control file', testrest('simple.json', {
    server: require('./server')
  }));
  */
});