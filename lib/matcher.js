var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    _existsSync = fs.existsSync || path.existsSync,
    reRegex = /^~\/(.*)\/(.*)$/;

module.exports = function(parser, rule, matchData) {
    
    var reMatch = reRegex.exec(matchData[1]),
        targetFile = path.join(path.dirname(parser.filename), matchData[1]);
    
    // if the matchdata contains a regular expression specification (starts with a ~/blah/) then compile a regex
    if (reMatch) {
        var regex = new RegExp(reMatch[1], reMatch[2]);
        
        return function(buffer) {
            assert(regex.test(buffer.toString()));
        };
    }
    else if (_existsSync(targetFile)) {
        return function(buffer, done) {
            console.log(buffer);
            done();
        };
    }
    
    return function() {
        assert.fail('no data');
    };
};