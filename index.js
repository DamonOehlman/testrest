var debug = require('debug')('testrest');
var path = require('path');
var assert = require('assert');
var yaml = require('js-yaml');
var fs = require('fs');
var util = require('util');
var _ = require('underscore');
var _existsSync = fs.existsSync || path.existsSync;
var testrequest = require('./lib/testrequest');
var ignoreKeys = [].concat(testrequest.methodNames);

var defaultOpts = {
  baseUrl: 'http://localhost:3000',
  engine: 'mocha'
};

/**
  # testrest

  testREST is a testing helper that is designed to make the process of testing
  your REST application easier to write and easier to read. A simple
  [YAML](http://www.yaml.org/) definition file format is used to describe tests.

  ## Example Usage

  First a `.yaml` file is defined for the test that you want to run. Displayed
  below is an example from the testrest tests:

  <<< test/headers.yaml

  Now the above tests a designed to test a simple server that echos header values
  and cookie values back in a JSON response, and when run in conjuction with the
  following mocha test file, will execute successfully:

  <<< test/headers.js

**/

/**
## checkForServer

This function inspects the opts that have been provided to testrest and determines whether a
server has been specified for use.
*/
function checkForServer(opts) {
  var serverInstance;

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
      function(cb) {
        // close the server instance
        serverInstance.close();

        // if the server instance is still running, then wait for the close event
        if (serverInstance.address()) {
          serverInstance.once('close', cb);
        }
        // otherwise trigger the callback straight away
        else {
          cb();
        }
      }
    ].concat(opts.after || []);
  };

  return opts;
}

/**
## expandFileReferences

This function is used to expand file references that are encountered in the suite data.

*/
function expandFileReferences(data, basePath) {
  var targetPath
    , stats;

  // iterate through the keys in the data
  _.each(data, function(value, key) {
    // if the key is in any of the ignore keys, then skip this check
    if (ignoreKeys.indexOf(key) >= 0) return;

    // if the value is a string, then we are going to have to take a
    // look and see if it references a file
    if (typeof value == 'string' || (value instanceof String)) {
      targetPath = path.resolve(basePath, value);

      // if this is a valid path, then load the file
      debug('checking to see if "' + value + '" is a file: ' + targetPath);
      if (_existsSync(targetPath)) {
        // get the stats for the file
        stats = fs.statSync(targetPath);
        if (stats.isFile()) {
          debug('attempting to extract data for key "' + key + '" from file: ' + targetPath);
          value = fs.readFileSync(targetPath, 'utf8');

          // try json parsing it
          try {
            value = JSON.parse(value);
          }
          catch (e) {
            // not JSON, which is ok, leave as a string
          }
        }
      }
    }

    // if the value is an object and not a string, then recurse
    if (typeof value == 'object' && (! (value instanceof String))) {
      data[key] = expandFileReferences(value, basePath);
    }
    // otherwise, simply update the data with the potentially updated value
    else {
      data[key] = value;
    }
  });

  // return the data
  return data;
}

/**
## loadSuite
This function is used to load a test suite from a specified definition file.
*/
function loadSuite(definitionFile, opts) {
  var ext = path.extname(definitionFile)
    , suite = require(definitionFile);

  // TODO: attempt to load a parser first, and if not available
  // fall back to requiring the file

  // if test data is an array, then create a top level testdata object
  // and insert the items as the tests member
  if (Array.isArray(suite)) {
    suite = {
      opts: {}
    , tests: [].concat(suite)
    }
  }

  // iterate through the tests and normalize the tests
  suite.tests.forEach(function(testdata, index) {
    // create a new test object and merge the test data into it
    var test = suite.tests[index] = testrequest.create();

    // update the baseUrl of the test
    test.baseUrl = opts.baseUrl;

    // update the test request from the data loaded from the definition file
    _.extend(test, expandFileReferences(testdata, path.dirname(definitionFile)));
  });

  return suite;
}

/**
## wrapTasks
This is a private helper function that ensures that functions will fire a callback
even if they are designed to work in that way
*/
function wrapTasks(fns) {
  return fns.map(function(fn, index) {
    if (typeof fn == 'function' && fn.length === 0) {
      return function(cb) {
        fn();
        cb();
      };
    }

    return fn;
  });
}

/**
## testrest
*/
var testrest = module.exports = function(definitionFile, opts) {
  var content
    , parser
    , suite;

  // initialise the definition file name
  definitionFile = path.resolve(
    path.dirname(module.parent.filename),
    definitionFile || 'api'
  );

  // if an extension hasn't been provided, default to .txt
  if (path.extname(definitionFile) === '') {
    definitionFile += '.yaml';
  }

  // load the control file content
  content = fs.readFileSync(definitionFile, 'utf8');

  // initialise the opts
  opts = _.extend({}, defaultOpts, opts);

  // load and normalize the rules
  suite = loadSuite(definitionFile, opts);

  // extend the opts with the suite opts
  _.extend(opts, suite.opts);

  // check the server opts
  opts = checkForServer(opts);

  // ensure we have a before and after array
  opts.before = wrapTasks([].concat(opts.before || []));
  opts.after = wrapTasks([].concat(opts.after || []));

  // produce the test engine specific output
  return require('./engines/' + opts.engine)(suite.tests, opts);
};
