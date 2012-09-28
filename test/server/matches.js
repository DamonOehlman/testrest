var tako = require('tako'),
    fs = require('fs'),
    path = require('path'),
    app = tako();

app.route('/array-of-numbers').json([1, 2, 3, 4, 5]).methods('GET');

module.exports = app.httpServer;