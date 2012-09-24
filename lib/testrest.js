var debug = require('debug')('testrest'),
    path = require('path'),
    assert = require('assert'),
    fs = require('fs'),
    util = require('util'),
    Parser = require('./parser');

function testrest(definitionFile, opts) {
    var definition;
    
    // ensure we have opts
    opts = opts || {};
    
    // initialise the definition file name
    definitionFile = path.resolve(
        path.dirname(module.parent.filename),
        definitionFile || 'api'
    );
    
    // ensure the definition file has the .rest extension
    if (path.extname(definitionFile) !== '.txt') {
        definitionFile += '.txt';
    }
    
    return function() {
        var rules = [];
        
        // load the definition file
        it('can load the definition file: ' + path.basename(definitionFile), function(done) {
            fs.readFile(definitionFile, 'utf8', function(err, data) {
                assert.ok(data, 'Unable to read definition file: ' + definitionFile);

                definition = data;
                done(err, data);
            });
        });
        
        it('can parse the definition file', function(done) {
            var parser = new Parser(definitionFile, opts);
            
            parser.on('rule', function(rule) {
                rules.push(rule);
            });
            
            parser.on('end', function() {
                describe(path.basename(definitionFile), function() {
                    before(opts.before);
                    
                    rules.forEach(function(rule) {
                        it(rule.getFullTitle(), rule.createTest());
                    });
                    
                    after(opts.after);
                });
                
                done();
            });
            
            // parse the definition file
            parser.parse(definition);
        });
    };
}

exports = module.exports = testrest;
exports.cmdline = require('./cmdline');