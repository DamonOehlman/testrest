var debug = require('debug')('testrest'),
    request = require('request'),
    assert = require('assert'),
    sniff = require('sniff');

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
}

Rule.prototype.createTest = function() {
    var rule = this;
    
    function checkObject(reference, target) {
        Object.keys(reference).forEach(function(key) {
            assert.deepEqual(target[key], reference[key], 'Expected JSON response section mismatch');
        });
    }
    
    return function(done) {
        var asyncBodyCheck = false,
            requestData = {
                uri: rule.request.uri,
                body: rule.request.body,
                json: typeof rule.request.body != 'string',
                method: (rule.request.method || 'GET').toUpperCase(),
                headers: {}
            };

        // initialise the headers
        (rule.request.headers || []).forEach(function(header) {
            requestData.headers[header.name] = header.value;
        });

        debug('sending request to server', requestData);
        request(requestData, function(err, res, body) {
            var resCheck = rule.response;

            // check that the request hasn't errored
            assert.ifError(err);

            // check the status code
            if (resCheck.codeRegex) {
                debug(
                    'checking to see if statusCode passes: ' + res.statusCode, 
                    resCheck.codeRegex.test(res.statusCode)
                );
                
                assert.ok(resCheck.codeRegex.test(res.statusCode), 'Status mismatch: ' + res.statusCode + ' !== ' + resCheck.code);
            }

            debug('have ' + resCheck.headers.length + ' headers to check', resCheck.headers);
            
            // iterate through the headers and test them
            resCheck.headers.forEach(function(header) {
                var headerValue = res.headers[header.name.toLowerCase()];
                
                debug('checking response header: ' + header.name);
                
                assert.ok(headerValue, 'Header "' + header.name + '" not found in response');
                assert.equal(headerValue, header.value, 'Header "' + header.name +
                    '" does not equal expected value (expected: "' + header.value + '", actual: "' +
                    headerValue + '")');
            });

            // if we have a body, then do some tests on it
            if (resCheck.body) {
                debug('need to check for the body, looking for: ', resCheck.body);

                // attempt to convert the body to a JSON representation but fallback gracefully if it doesn't succeed
                if (typeof body == 'string' || (body instanceof String)) {
                    try {
                        body = JSON.parse(body);
                    }
                    catch (e) {}
                }

                debug('received body type: ' + typeof body);
                debug('received body: ', body);

                // if we have a body and it's a string, then check for a plain old string match
                if (typeof resCheck.body == 'string' || resCheck.body instanceof String) {
                    assert.equal(body, resCheck.body, 'Response body does not match expected');
                }
                // otherwise if resCheck.body is a function, then provide it the response body to test
                else if (typeof resCheck.body == 'function') {
                    // if we have a two argument function handler, then we have an async handler
                    // update the asyncBodyCheck variable to indicate that the handler will call the done
                    asyncBodyCheck = resCheck.body.length > 1;
                    
                    // invoke the resCheck handler
                    resCheck.body.call(res, body, done);
                }
                // otherwise if we receieved an array, then check the response matches
                else if (sniff(resCheck.body) == 'array') {
                    assert.equal(sniff(body), 'array', 'Expected array response, but did not receive an array');
                    
                    // check each item with the object checking rules
                    resCheck.body.forEach(function(item, index) {
                        checkObject(item, body[index]);
                    });
                }
                // or, if we have a body and it's an object, then interate through the keys of
                // the check object and look for a deep equal
                else if (typeof resCheck.body == 'object') {
                    checkObject(resCheck.body, body);
                }
            }
            
            if (! asyncBodyCheck) {
                debug('check complete, calling done() callback');
                done();
            }
        });
    };
};

Rule.prototype.getFullTitle = function() {
    return this.comment || 'no title';
};

module.exports = Rule;