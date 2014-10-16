var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var ip = process.env.IP  || undefined;
app.use(express.static(__dirname + '/client'));
var server = require('http').createServer(app);
// Start server
server.listen(port, ip, function () {
  console.log('Express server listening on %d!', port);
});

// Expose app
exports = module.exports = app;