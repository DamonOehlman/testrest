var path = require('path'),
    fs = require('fs'),
    mocha = require('mocha'),
    Suite = mocha.Suite,
    testrest = require('../'),
    reUrl = /^https?\:\/\//,
    targets = [],
    sourceFiles = [],
    opts = {};
    
function runTests() {
    var main = new Suite('testREST'),
        runner = new mocha.Runner(main),
        reporter = new mocha.reporters.Spec(runner);
        
    // iterate through the targets and create sub tests
    targets.forEach(function(target) {
        var suite = Suite.create(main, target);
        
        testrest(target, opts).call(suite);
    });
    
    // run the test suite
    runner.run();
}

function expandNextSource() {
    if (sourceFiles.length <= 0) {
        runTests();
    }
    else {
        var testPath = path.resolve(sourceFiles.shift());
        
        fs.stat(testPath, function(err, stats) {
            if (err) {
                expandNextSource();
            }
            else if (stats.isDirectory()) {
                fs.readdir(testPath, function(err, files) {
                    (files || []).forEach(function(file) {
                        if (path.extname(file) === '.txt') {
                            targets.push(path.join(testPath, file));
                        }
                    });
                    
                    expandNextSource();
                });
            }
            else {
                targets.push(testPath);
                expandNextSource();
            }
        });
    }
}

module.exports = function() {
    process.argv.slice(2).forEach(function(arg) {
        if (reUrl.test(arg)) {
            opts.server = arg;
        }
        else {
            sourceFiles.push(arg);
        }
    });

    expandNextSource();
};