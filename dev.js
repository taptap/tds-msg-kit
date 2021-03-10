const express = require('express');
const fs = require('fs');
const appClient = express();

appClient.use('/js', express.static('dist'));

appClient.get('/tap-dm/wait', function (req, res) {
  const content = fs.readFileSync('./demo/tap-dm/wait.html');
  res.set('Content-Type', 'text/html');
  res.send(content.toString());
});

appClient.listen(3000, function () {
  console.log('Example Client listening on port 3000!');
});

const appServer = express();
appServer.use('/js', express.static('dist'));
appServer.get('/', function (req, res) {
  const content = fs.readFileSync('./demo/index.html');
  res.set('Content-Type', 'text/html');
  res.send(content.toString());
});
appServer.listen(3001, function () {
  console.log('Example server listening on port 3001!');
});
