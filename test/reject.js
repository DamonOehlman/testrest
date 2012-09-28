var testrest = require('../');

describe('rejection tests', function() {
  describe('yaml control file', testrest('reject', {
    server: require('./server/reject')
  }));
});