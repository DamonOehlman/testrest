var debug = require('debug')('testrest')
  , path = require('path')
  , assert = require('assert')
  , yaml = require('js-yaml')
  , fs = require('fs')
  , util = require('util')
  , defaultOpts = {
      baseUrl: 'http://localhost:3000'
    , engine: 'mocha'
    }
  , _ = require('underscore')
  , TestRequest = require('./lib/testrequest');
  

function loadSuite(definitionFile, opts) {
  var suite = require(definitionFile);
  
  // if test data is an array, then create a top level testdata object 
  // and insert the items as the tests member
  if (Array.isArray(suite)) {
    suite = {
      opts: {},
      tests: [].concat(suite)
    }
  }
  
  // iterate through the tests and normalize the tests
  suite.tests.forEach(function(testdata, index) {
    // create a new test object and merge the test data into it
    var test = suite.tests[index] = new TestRequest(definitionFile);
    
    // update the baseUrl of the test
    test.baseUrl = opts.baseUrl;
    
    // update the test request from the data loaded from the definition file
    _.extend(test, testdata);
  });
  
  return suite;
}

function testrest(definitionFile, opts) {
  var ext = path.extname(definitionFile)
    , content
    , parser
    , suite
    , serverInstance;
  
  // initialise the definition file name
  definitionFile = path.resolve(
    path.dirname(module.parent.filename),
    definitionFile || 'api'
  );
  
  // if an extension hasn't been provided, default to .txt
  if (ext === '') {
    definitionFile += '.yaml';
  }
  // initialise the opts
  opts = _.extend({}, defaultOpts, opts);  

  // load and normalize the rules
  suite = loadSuite(definitionFile, opts);
  
  // extend the opts with the suite opts
  _.extend(opts, suite.opts);
  
  // check for a server instance
  if (opts.server && opts.server.listen && opts.server.close) {
    serverInstance = opts.server;
  }

  // if we have a server instance, then create start and stop bindings
  if (serverInstance) {
    opts.before = [
      serverInstance.listen.bind(serverInstance, opts.port || 3000)
    ].concat(opts.before || []);
    
    opts.after = [
      serverInstance.close.bind(serverInstance)
    ].concat(opts.after || []);
  };
  
  // ensure we have a before and after array
  opts.before = [].concat(opts.before || []);
  opts.after = [].concat(opts.after || []);
  
  // produce the test engine specific output
  return require('./engines/' + opts.engine)(suite.tests, opts);
}

module.exports = testrest;