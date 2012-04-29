var debug = require('debug')('testrest'),
    superagent = require('superagent'),
    assert = require('chai').assert,
    sniff = require('sniff'),
    Test = require('mocha').Test;

function Rule() {
    this.request = {
        method: 'GET',
        uri: '',
        body: '',
        headers: []
    };

    // define expected as null
    // this will be created once we have encountered the expect statement in the 
    // rule definition
    this.response = null;
};

Rule.prototype.createTest = function() {
    var rule = this;
    
    function checkObject(reference, target) {
        Object.keys(reference).forEach(function(key) {
            assert.deepEqual(target[key], reference[key], 'Expected JSON response section mismatch');
        });
    }
    
    return function(done) {
        var request = superagent(rule.request.method, rule.request.uri);

        // add the headers
        rule.request.headers.forEach(function(header) {
            request.set(header.name, header.value);
        });

        // if we have a body then add it
        if (rule.request.body) {
            request.send(rule.request.body);
        }
        
        request.end(function(res) {
            var resCheck = rule.response;
            
            // iterate through the response checks
            // console.log(res);
            
            // check the status code
            if (resCheck.codeRegex) {
                assert.ok(resCheck.codeRegex.test(res.statusCode), 'Status mismatch: ' + res.statusCode + ' !== ' + resCheck.code);
            }
            
            // iterate through the headers and test them
            resCheck.headers.forEach(function(header) {
                var headerValue = res.header[header.name.toLowerCase()];
                
                debug('checking response header: ' + header.name);
                
                assert.ok(headerValue, 'Header "' + header.name + '" not found in response');
                assert.equal(headerValue, header.value, 'Header "' + header.name + 
                    '" does not equal expected value (expected: "' + header.value + '", actual: "' 
                    + headerValue + '")');
            });

            // if we have a body, then do some tests on it
            if (resCheck.body) {
                // if we have a body and it's a string, then check for a plain old string match
                if (typeof resCheck.body == 'string' || resCheck.body instanceof String) {
                    assert.equal(res.body, resCheck.body, 'Response body does not match expected');
                }
                // otherwise if we receieved an array, then check the response matches
                else if (sniff(resCheck.body) == 'array') {
                    assert.equal(sniff(res.body), 'array', 'Expected array response, but did not receive an array');
                    
                    // check each item with the object checking rules
                    resCheck.body.forEach(function(item, index) {
                        checkObject(item, res.body[index]);
                    });
                }
                // or, if we have a body and it's an object, then interate through the keys of 
                // the check object and look for a deep equal
                else if (typeof resCheck.body == 'object') {
                    checkObject(resCheck.body, res.body);
                }
            }
            
            done();
        });
    };
};

Rule.prototype.getFullTitle = function() {
    return this.comment || 'no title';
};

module.exports = Rule;