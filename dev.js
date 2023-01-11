const express = require('express');
const fs = require('fs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv)).argv;
const { p: port = 3000 } = argv;

const appClient = express();

appClient.use('/js', express.static('dist'));

appClient.get('/tap-dm/wait', function (req, res) {
  const content = fs.readFileSync('./demo/tap-dm/wait.html');
  res.set('Content-Type', 'text/html');
  res.send(content.toString());
});

appClient.listen(port, function () {
  console.log(`Example Client listening on port ${port}!`);
});

const appServer = express();
appServer.use('/js', express.static('dist'));
appServer.get('/', function (req, res) {
  const content = fs.readFileSync('./demo/index.html');
  res.set('Content-Type', 'text/html');
  res.send(content.toString());
});
appServer.listen(port + 1, function () {
  console.log(`Example server listening on port ${port + 1}!`);
});
