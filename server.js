const express = require('express');
const http = require('http');
const socket_io = require('socket.io');
const path = require('path');

// Environment
const prodHost = 'https://node-velha.herokuapp.com';
const PORT = process.env.PORT || 3000;
const production = process.env.NODE_ENV === 'production' ? true : false;
const HOST = production? prodHost : 'http://localhost';

// Servers setup
const app = express();
app.disable('x-powered-by');

const server = http.createServer(app);
const sioServer = socket_io(server);

server.listen(PORT, () => 
  console.log(`Express server listening on port ${PORT}...`));

// Game logic
const connectedSockets = [];
let turn = 0;
let gameState = [0, 0, 0, 0, 0, 0, 0, 0, 0];

function getPlayerSocket(playerNum){
  return connectedSockets[playerNum - 1];
}

// Routes
app.use(express.static('www'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'www/index.html'));
});

app.get('/js/config.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.send(`const PORT = ${PORT};\nconst HOST = '${HOST}';`);
});

// Sockets
sioServer.on('connection', (socket) => {
  console.log('Socket client connected.', socket.id);
  sioServer.sockets.emit('state', gameState);

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
