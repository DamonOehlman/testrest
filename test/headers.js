var testrest = require('../');

describe('header tests', testrest('headers', {
  server: require('./server/headers')
}));