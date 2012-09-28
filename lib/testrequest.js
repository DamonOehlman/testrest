var assert = require('assert')
  , debug = require('debug')('testrest')
  , request = require('request')
  , _ = require('underscore')
  , reAbsUrl = /^\w+\:\/\//
  , reStatusWildcard = /^(\d)x+$/
  , reTrailingSlash = /\/$/;
  
// define the supported method names
exports.methodNames = ['get', 'post', 'put', 'delete', 'head'];
  
/* private helpers */

function createStatusCheck(code) {
  var wildcardMatch = reStatusWildcard.exec(code)
    , regex;
    
  if (wildcardMatch) {
      regex = new RegExp('^' + wildcardMatch[1] + '.*$');
  }
  else {
      regex = new RegExp('^' + code + '$');
  }
  
  return regex.test.bind(regex);
}
  
/* TestRequest */

function TestRequest() {
  // initialise the members
  this.description = '';
  this.baseUrl = '';

  // initialise the hidden properties
  // these properties are accessed and modified through getters and setters defined below
  this._expect = { status: '2xx' };

  // initialise the request opts
  this._requestOpts = {};
}

TestRequest.prototype = {};

/**
## method modifiers
This property setter is used to configure the request opts for the test request
*/
exports.methodNames.forEach(function(method) {
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

/**
## cookies property

Wire in some cookies into the request headers
*/
Object.defineProperty(TestRequest.prototype, 'cookies', {
  set: function(value) {
    var cookieValues = [];
    
    // ensure we have a request opts object
    if (! this._requestOpts.headers) {
      this._requestOpts.headers = {};
    }
    
    // iterate through the values, and update the cookie values
    _.each(value, function(value, key) {
      cookieValues.push(key + '=' + value);
    });
    
    // initialise the cookie in the header
    this._requestOpts.headers.cookie = cookieValues.join('; ');
  }
});

/**
## expect property
*/
Object.defineProperty(TestRequest.prototype, 'expect', {
  set: function(value) {
    // if we have been provided a simple string value or number
    // then update the status code of the expect value
    if (typeof value == 'number' || typeof value == 'string' || (value instanceof String)) {
      this._expect = { status: value };
    }
    // otherwise, clone the provided value
    else {
      this._expect = _.clone(value);
    }
  
    // convert the status code to a regex
    if (this._expect.status) {
      this._expect.statusCheck = createStatusCheck(this._expect.status);
    }
  }
});

/**
## headers property

Provide headers that will be added to the request
*/
Object.defineProperty(TestRequest.prototype, 'headers', {
  set: function(value) {
    // extend the existing headers
    this._requestOpts.headers = _.extend({}, this._requestOpts.headers, value);
  }
});

/**
## reject property

Setting the reject property creates an inverse `expect` property
*/
Object.defineProperty(TestRequest.prototype, 'reject', {
  set: function(value) {
    // set the expect property
    this.expect = value;
    
    // initialise the inverse property to true
    this._expect.inverse = true;
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

// export the create function
exports.create = function() {
  return new TestRequest();
};