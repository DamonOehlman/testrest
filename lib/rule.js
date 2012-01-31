var debug = require('debug')('testrest'),
    superagent = require('superagent'),
    assert = require('chai').assert,
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
    
    return new Test(this.getFullTitle(), function(done) {
        var request = superagent(rule.request.method, rule.request.uri);

        // add the headers
        rule.request.headers.forEach(function(header) {
            request.set(header.name, header.value);
        });

        // if we have a body then add it
        if (rule.request.body) {
            request.data(rule.request.body);
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
            
            done();
        });
    });
};

Rule.prototype.getFullTitle = function() {
    return this.comment || 'no title';
};

module.exports = Rule;