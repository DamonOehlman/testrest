var assert = require('assert')
  , request = require('request')
  , _ = require('underscore')
  , reAbsUrl = /^\w+\:\/\//
  , reStatusWildcard = /^(\d)x+$/
  , reTrailingSlash = /\/$/;
  
// define the supported method names
exports.methodNames = ['get', 'post', 'put', 'delete', 'head'];
  
/* private helpers */

function checkObject(reference, target, checkEqualFn) {
  Object.keys(reference).forEach(function(key) {
    checkEqualFn(
      target[key]
    , reference[key]
    , 'JSON mismatch: ' + target[key] + ' !== ' + reference[key] + ' (for key: ' + key + ')'
    );
  });
}

function createStatusRegex(code) {
  var wildcardMatch = reStatusWildcard.exec(code);
  if (wildcardMatch) {
      return new RegExp('^' + wildcardMatch[1] + '.*$');
  }
  else {
      return new RegExp('^' + code + '$');
  }
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

TestRequest.prototype = {
  request: function(callback) {
    var test = this
      , expect = this._expect
      , checkOK = expect.inverse ? assert.fail : assert
      , checkEqual = expect.inverse ? assert.notDeepEqual : assert.deepEqual;
    
    // make the request
    request(this._requestOpts, function(err, res, body) {
      // validate that we didn't receive an error
      assert.ifError(err);
      
      // if we have a status code regex, run it
      if (expect.statusRegex) {
        // check the response
        checkOK(
          expect.statusRegex.test(res.statusCode)
        , 'Expected ' + expect.status + ' received ' + res.statusCode
        );
      }
      
      // if we have headers, then do a comparison
      
      // if we have a body to compare, then do a deep compare
      if (expect.body) {
        // try JSON parsing the body
        try {
          body = JSON.parse(body);
        }
        catch (e) {
        }
        
        // do a comparison of the body
        if (typeof expect.body === 'object' && (! (expect.body instanceof String))) {
          checkObject(expect.body, body, checkEqual);
        }
        else {
          checkEqual(expect.body, body);
        }
      }
  
      // trigger the callback
      callback(err);
    });
  }
};

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
  
    // convert the status code to a regex
    if (this._expect.status) {
      this._expect.statusRegex = createStatusRegex(this._expect.status);
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