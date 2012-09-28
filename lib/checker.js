var assert = require('assert')
  , formatter = require('formatter')
  , errors = {
      bodyMismatch: 'Response body did not match expected ({{0}} !== {{1}})'
    , bodyNoMatch: 'Response body did not match any of the expected formats'
    , jsonMismatch: 'JSON mismatch: {{0}} !== {{1}} (for key: {{2}})'
    , statusMismatch: 'Response status did not match expected: {{ 0 }} !== {{ 1 }}'
    }
  , request = require('request')
  , _ = require('underscore');
  
// create formatter functions for the errors
_.each(errors, function(message, key) {
  errors[key] = formatter(message);
});

function checkObject(reference, target, checkEqualFn) {
  Object.keys(reference).forEach(function(key) {
    checkEqualFn(
      target[key]
    , reference[key]
    , errors.jsonMismatch(target[key], reference[key], key)
    );
  });
}

module.exports = function(test, callback) {
  var expect = test._expect
    , errorMessage
    , checkOK = expect.inverse ? assert.fail : assert
    , checkEqual = expect.inverse ? assert.notDeepEqual : assert.deepEqual;
  
  // make the request
  request(test._requestOpts, function(err, res, body) {
    // validate that we didn't receive an error
    assert.ifError(err);
    
    // CHECK THE STATUS CODE
    
    // if we have a status code regex, run it
    if (typeof expect.statusCheck == 'function') {
      // check the response
      checkOK(
        expect.statusCheck(res.statusCode)
      , errors.statusMismatch(expect.status, res.statusCode)
      );
    }
    
    // CHECK THE HEADERS
    
    // if we have headers, then do a comparison
    
    // CHECK THE BODY
    
    // try JSON parsing the body
    try {
      body = JSON.parse(body);
    }
    catch (e) {
    }
    
    // if we have a body check function, then run that
    if (typeof expect.bodyCheck == 'function') {
      checkOK(expect.bodyCheck(body), errors.bodyNoMatch);
    }
    // if we have a body to compare, then do a deep compare
    else if (expect.body) {
      // if we have an array or a simple object, check for equality
      if (Array.isArray(expect.body) || (typeof expect.body != 'object')) {
        checkEqual(expect.body, body, errors.bodyMismatch(body, expect.body));
      }
      // otherwise do a comparison on the object
      else {
        checkObject(expect.body, body, checkEqual);
      }
    }
  
    // trigger the callback
    callback(err);
  });
};