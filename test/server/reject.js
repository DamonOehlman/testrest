var tako = require('tako'),
    fs = require('fs'),
    path = require('path'),
    app = tako();

app.route('/empty-fail').json([]);

module.exports = app.httpServer;