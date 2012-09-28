var testrest = require('../');

describe('simple GET tests', function() {
  describe('yaml control file', testrest('simple', {
    server: require('./server')
  }));

  describe('json control file', testrest('simple.json', {
    server: require('./server')
  }));
});