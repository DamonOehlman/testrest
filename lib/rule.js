var Test = require('mocha').Test;

function Rule() {
    
};

Rule.prototype.createTest = function() {
    return new Test(this.getFullTitle(), function(done) {
        done();
    });
};

Rule.prototype.getFullTitle = function() {
    return this.comment || 'no title';
};

module.exports = Rule;