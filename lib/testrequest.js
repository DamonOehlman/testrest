var assert = require('assert')
  , request = require('request')
  , _ = require('underscore')
  , reAbsUrl = /^\w+\:\/\//
  , reTrailingSlash = /\/$/;

function TestRequest(definitionFile) {
  // initialise the defintion filename
  this.definitionFile = definitionFile;
  
  // initialise the members
  this.description = '';
  this.baseUrl = '';

  // initialise the hidden properties
  // these properties are accessed and modified through getters and setters defined below
  this._expect = { status: '2xx' };

  // initialise the request opts
  this._requestOpts = {};
}

TestRequest.prototype = {
  request: function(callback) {
    var test = this;
    
    // make the request
    request(this._requestOpts, function(err, body, res) {
      // validate that we didn't receive an error
      assert.ifError(err);
      
      // trigger the callback
      callback(err);
    });
  }
};

/**
## method modifiers
This property setter is used to configure the request opts for the test request
*/
['get', 'post', 'put', 'delete', 'head'].forEach(function(method) {
  Object.defineProperty(TestRequest.prototype, method, {
    set: function(value) {
      // if the url is not absolute, then attach the baseurl
      if (! reAbsUrl.test(value)) {
        value = this.baseUrl.replace(reTrailingSlash) + value;
      }
      
      this._requestOpts.uri = value;
      this._requestOpts.method = method.toUpperCase();
    }
  });
});

/**
## body modifer
Update the request body to either the provided string or JSON representation. In the case that
the value passed to the setter relates to a file, then the contents of the file are loaded and
pushed into the body
*/
Object.defineProperty(TestRequest.prototype, 'body', {
  set: function(value) {
    var isObject = typeof value == 'object' && (! (
        (value instanceof String) || (value instanceof Buffer)
      ))
      , targetProp = isObject ? 'json' : 'body';

    this._requestOpts[targetProp] = value;
  }
});

Object.defineProperty(TestRequest.prototype, 'expect', {
  get: function() {
    return this._expect;
  }

  , set: function(value) {
    // if we have been provided a simple string value or number
    // then update the status code of the expect value
    if (typeof value == 'number' || typeof value == 'string' || (value instanceof String)) {
      this._expect = { status: value };
    }
    // otherwise, clone the provided value
    else {
      this._expect = _.clone(value);
    }
  }
});

/**
## it aliases to description
*/
Object.defineProperty(TestRequest.prototype, 'it', {
  set: function(value) {
    this.description = value;
  }
});

module.exports = TestRequest;