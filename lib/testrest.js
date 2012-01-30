var path = require('path'),
    expect = require('chai').expect,
    fs = require('fs'),
    reComment = /^\s*\#\s?(.*)$/,
    reRequest = /^\s*(GET|POST|PUT|DELETE|HEAD|OPTIONS)\s(.*)/,
    reResponse = /^\s*EXPECT/,
    RestDefinition = require('./definition');

function testrest(definitionFile) {
    var definition, rules;
    
    definitionFile = path.resolve(
        path.dirname(module.parent.filename),
        definitionFile || path.basename(module.parent.filename, '.js')
    );
    
    // ensure the definition file has the .rest extension
    if (path.extname(definitionFile) !== '.rest') {
        definitionFile += '.rest';
    }

    
    console.log(definitionFile);
    
    return function() {
        // load the definition file
        it('can load the definition file: ' + path.basename(definitionFile), function(done) {
            fs.readFile(definitionFile, 'utf8', function(err, data) {
                expect(data).to.exist;

                definition = data;
                done(err, data);
            });
        });
        
        it('can parse the definition file', function() {
            rules = new RestDefinition();
            rules.parse(definition);
        });

        it('Hi there', function(done) {
            done();
        });
    };
};

module.exports = testrest;