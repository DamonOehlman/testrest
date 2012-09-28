var async = require('async')
  , request = require('request');

module.exports = function(tests, opts) {
  return function() {
    before(function(done) {
      async.series(opts.before, done);
    });
    
    after(function(done) {
      async.series(opts.after, done);
    });
    
    // iterate through the rules and create the tests
    tests.forEach(function(test) {
      it(test.description, require('../lib/checker').bind(null, test));
    });
  };
};