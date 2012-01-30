var Test = require('mocha').Test;

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
    return new Test(this.getFullTitle(), function(done) {
        done();
    });
};

Rule.prototype.getFullTitle = function() {
    return this.comment || 'no title';
};

module.exports = Rule;