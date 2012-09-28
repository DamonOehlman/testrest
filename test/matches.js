var testrest = require('../');

describe('matches tests', function() {
  describe('yaml control file', testrest('matches', {
    server: require('./server/matches')
  }));
});