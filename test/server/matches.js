var server = module.exports = require('http').createServer();
var app = require('firetruck')(server);

app('/array-of-numbers').json([1, 2, 3, 4, 5]);
