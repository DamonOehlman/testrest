var server = module.exports = require('http').createServer();
var app = require('firetruck')(server);

app('/empty-fail').json([]);
