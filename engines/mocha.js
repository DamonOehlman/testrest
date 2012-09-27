var request = require('request');

module.exports = function(tests, opts) {
  return function() {
    opts.before.forEach(before);
    opts.after.forEach(after);
    
    // iterate through the rules and create the tests
    tests.forEach(function(test) {
      it(test.description, test.request.bind(test));
    });
  };
};