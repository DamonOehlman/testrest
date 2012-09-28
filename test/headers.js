var testrest = require('../');

describe('header tests', function() {
  describe('yaml control file', testrest('headers', {
    server: require('./server/headers')
  }));
});