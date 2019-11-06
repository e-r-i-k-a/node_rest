const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 9000;
const app = express();
const {connection} = require('../db');

const init = async () => {
  app
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use('/api', require('./api'))

  await connection;

  let server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`listening on port ${server.address().port}!`)
  });
};

init();

module.exports = {
  PORT,
  app
};
