const express = require('express');
const http = require('http');
const sio = require('socket.io');
const path = require('path');

const app = express();
app.disable('x-powered-by');
app.use(express.static('www'));

const server = app.listen(3000, () => console.log('Listening...'));
const sio_server = sio(server);

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, 'game.html'));
});

sio_server.sockets.on('connection', (socket) => {
  console.log('Socket client connected.', socket.id);

  socket.on('click', pos => {
    console.log(
      `Socket ${socket.id} clicked on quadrant ${pos.x}, ${pos.y}`);
  });
});
