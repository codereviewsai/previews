const express = require('express');

const server = express();

server.get('/', (req, res) => {
  res.sendFile('index.html');
});

server.get('/hello', (req, res) => {
  res.json({
    message: process.env.MESSAGE || 'Hello World!'
  });
});

server.listen(3000, (err) => {
  if (err) throw err;

  console.log('Server started on port 3000');
});
