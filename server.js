const express = require('express');
const http = require('http');
const socket_io = require('socket.io');
const path = require('path');

const app = express();
app.disable('x-powered-by');
app.use(express.static('www'));

const server = http.createServer(app);
const sioServer = socket_io(server);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => 
  console.log(`Express server listening on port ${PORT}...`));

// Game logic
const connectedSockets = [];
let turn = 0;
let gameState = [0, 0, 0, 0, 0, 0, 0, 0, 0];

function getPlayerSocket(playerNum){
  return connectedSockets[playerNum - 1];
}

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, 'game.html'));
});

sioServer.on('connection', (socket) => {
  console.log('Socket client connected.', socket.id);

  if(connectedSockets.length === 0){
    socket.emit('message', 'You are player 1 (X).');
    connectedSockets.push(socket);
  } else if(connectedSockets.length === 1){
    socket.emit('message', 'You are player 2 (O).');
    connectedSockets.push(socket);
  } else{
    socket.emit('message', 'You are an observer.');
    connectedSockets.push(socket);
  }

  socket.on('click', pos => {
    console.log(
      `Socket ${socket.id} clicked on quadrant ${pos.x}, ${pos.y}`);

    if(socket.id === getPlayerSocket(1).id)
      gameState[pos.y * 3 + pos.x] = 1;
    else if(socket.id === getPlayerSocket(2).id)
      gameState[pos.y * 3 + pos.x] = 2;

    sioServer.sockets.emit('state', gameState);
  });
});
