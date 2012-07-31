var debug = require('debug')('testrest'),
    events = require('events'),
    util = require('util'),
    matcher = require('./matcher'),
    reStages = {
        comment: /^\s*\#\s?(.*)$/,
        request: /^\s*(GET|POST|PUT|DELETE|HEAD|OPTIONS)\s(.*)/,
        response:  /^\s*EXPECT\s?(\d.*)$/
    },
    reAbsUrl = /^\w+\:\/\//,
    reHeader = /^\s?(?:[<\>])\s(\w+)\s*\:\s*(\w.*?)\s*$/,
    reTrailingSlash = /\/$/,
    reStatusWildcard = /^(\d)x+$/,
    rePattern = /^match\:\s*(.*)$/,
    stageKeys = Object.keys(reStages),
    Rule = require('./rule');


function Parser(filename, opts) {
    // save a reference to the definition file
    this.filename = filename;
    
    // ensure we have options
    this.opts = opts || {};
    
    // initialise the base location
    this.server = this.opts.server || 'http://localhost:3000';
}

util.inherits(Parser, events.EventEmitter);

Parser.prototype._addHeader = function(target, match, raw) {
    if (match) {
        // if we don't have a headers array yet, then add it
        target.headers = target.headers || [];
        
        // add the header
        target.headers.push({
            name: match[1],
            value: match[2]
        });
    }
};

Parser.prototype._createStatusCodeRegex = function(code) {
    var wildcardMatch = reStatusWildcard.exec(code);
    if (wildcardMatch) {
        return new RegExp('^' + wildcardMatch[1] + '.*$');
    }
    else {
        return new RegExp('^' + code + '$');
    }
};

// ## line parsers

Parser.prototype._commentLine = function(rule, line) {
    rule.comment = line.replace(reStages.comment, '$1');
};

Parser.prototype._requestLine = function(rule, line) {
    var headerMatch = reHeader.exec(line);
    
    if (headerMatch) {
        // add the header to the request
        this._addHeader(rule.request, headerMatch, line);
    }
    else {
        var match = reStages.request.exec(line);

        // if we are in the request header, then initialise the url
        if (match) {
            rule.request.method = (match[1] || 'GET').toLowerCase();
            rule.request.uri = match[2];

            // if the uri is not an absolute url, then prepend the server url
            if (! reAbsUrl.test(rule.request.uri)) {
                rule.request.uri = this.server.replace(reTrailingSlash, '') + rule.request.uri;
            }
        }
        // otherwise, we are in the body, append
        else {
            rule.request.body += line;
        }
    }
};

Parser.prototype._responseLine = function(rule, line) {
    var headerMatch = reHeader.exec(line),
        patternMatch = rePattern.exec(line);
    
    if (headerMatch) {
        // add the header to the request
        this._addHeader(rule.response, headerMatch, line);
    }
    else if (patternMatch) {
        rule.response.body = matcher(this, rule, patternMatch);
    }
    else {
        var match = reStages.response.exec(line);
    
        // if we are in the expect header, then initialise the status code
        if (match) {
            rule.response = {
                code: match[1] || '2xx',
                body: '',
                headers: []
            };
        
            // add the code regex
            rule.response.codeRegex = this._createStatusCodeRegex(rule.response.code);
            debug('found EXPECT line, looking for status code: ' + rule.response.code);
        }
        // otherwise, we are working through the body of the request
        else {
            rule.response.body += line;
        }
    }
};

Parser.prototype.addRule = function(rule) {
    // attempt JSON parsing of body text
    [rule.request, rule.response].forEach(function(target) {
        try {
            target.body = JSON.parse(target.body);
        }
        catch (e) {
        }
    });
    
    // emit the rule
    this.emit('rule', rule);
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
        if (currentStage !== 'response' && currentStage !== 'responseHeader' && rule && rule.response) {
            // if we have an existing rule, then emit it
            if (rule) {
                parser.addRule(rule);
            }
            
            rule = new Rule();
        }
        
        if (currentStage) {
            parser['_' + currentStage + 'Line'].call(parser, rule, line);
        }
    });
    
    // if we have a rule with a valid expect condition, then emit the rule
    if (rule && rule.response) {
        this.addRule(rule);
    }
    
    // emit the end event
    this.emit('end');
};

module.exports = Parser;

