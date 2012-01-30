var debug = require('debug')('testrest'),
    events = require('events'),
    util = require('util'),
    reStages = {
        comment: /^\s*\#\s?(.*)$/,
        request: /^\s*(GET|POST|PUT|DELETE|HEAD|OPTIONS)\s(.*)/,
        sendHeader: /^\s?\>\s?(.*)$/,
        expect:  /^\s*EXPECT/,
        expectHeader: /^\s?\<\s?(.*)$/
    },
    stageKeys = Object.keys(reStages),
    Rule = require('./rule');


function Parser(text) {
}

util.inherits(Parser, events.EventEmitter);

// ## line parsers

Parser.prototype._commentLine = function(line) {
    rule.comment = line.replace(reStages.comment, '$1');
};

Parser.prototype._requestLine = function(line) {
    rule.request = {};
};

Parser.prototype._sendHeaderLine = function(line) {
    
};

Parser.prototype._expectLine = function(line) {
    rule.expect = {};
};

Parser.prototype._expectHeaderLine = function(line) {
    
};

Parser.prototype.parse = function(text) {
    var parser = this,
        rule = new Rule(),
        currentStage;
    
    // split the text on the linebreak character
    (text || '').split(/\n/).forEach(function(line) {
        // iterate through the stages and check for matches
        stageKeys.forEach(function(stage) {
            if (reStages[stage].test(line)) {
                // update the current stage
                currentStage = stage;
            }
        });
        
        // if we are not in the expect stage, and we have a current rule with an expect
        // condition, then reset the rule (we have a new one);
        if (currentStage !== 'expect' && rule && rule.expect) {
            // if we have an existing rule, then emit it
            if (rule) {
                parser.emit('rule', rule);
            }
            
            rule = new Rule();
        }
        
        parser['_' + currentStage + 'Line'].call(parser, line);
    });
    
    // if we have a rule with a valid expect condition, then emit the rule
    if (rule && rule.expect) {
        this.emit('rule', rule);
    }
    
    // emit the end event
    this.emit('end');
};

module.exports = Parser;

