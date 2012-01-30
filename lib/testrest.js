var debug = require('debug')('testrest'),
    path = require('path'),
    expect = require('chai').expect,
    fs = require('fs'),
    Parser = require('./parser');

function testrest(definitionFile) {
    var definition;
    
    definitionFile = path.resolve(
        path.dirname(module.parent.filename),
        definitionFile || path.basename(module.parent.filename, '.js')
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
                expect(data).to.exist;

                definition = data;
                done(err, data);
            });
        });
        
        it('can parse the definition file', function(done) {
            var parser = new Parser();
            
            parser.on('rule', function(rule) {
                debug('rule loaded', rule);
                rules.push(rule);
            });
            
            parser.on('end', done);
            
            // parse the definition file
            parser.parse(definition);
        });

        it('loads the rules as new tests', function() {
            var testSuite = this.parent;
            
            rules.forEach(function(rule) {
                testSuite.addTest(rule.createTest());
            });
        });
    };
};

module.exports = testrest;