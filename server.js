const express = require('express');
const http = require('http');
const socket_io = require('socket.io');
const path = require('path');

// Environment
const PORT = process.env.PORT || 3000;

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

function getPlayerStatus(socket){
  if(connectedSockets.length > 0 && connectedSockets[0].id === socket.id)
    return 'player 1 (X)';
  if(connectedSockets.length > 1 && connectedSockets[1].id === socket.id)
    return 'player 2 (O)';
  if(connectedSockets.findIndex(client => client.id === socket.id) !== -1)
    return 'observer';
}

function removeDisconnected(socket){
  let idx = connectedSockets.findIndex(client => client.id === socket.id);
  if(idx === -1){
    console.log('There is no client with ID: ', socket.id);
    return;
  }
  connectedSockets.splice(idx, 1);
}

// Routes
app.use(express.static('www'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'www/index.html'));
});

app.get('/js/config.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.send(`const PORT = ${PORT};`);
});

// Sockets
function forAllSockets(callback){
  Object.keys(sioServer.sockets.sockets).forEach(
    key => callback(sioServer.sockets.sockets[key]));
}

sioServer.on('connection', (socket) => {
  console.log(`Client ${socket.id} connected.`);
  sioServer.sockets.emit('state', gameState);
  connectedSockets.push(socket);
  const player = getPlayerStatus(socket);
  socket.emit('message', `You are connected as ${player}.`);

  socket.on('disconnect', () => {
    console.log(`Client ${socket.id} disconnected.`);
    removeDisconnected(socket);
    sioServer.sockets.emit('message', `Client ${socket.id} has disconnected.`);

    forAllSockets((otherSocket) => {
      const otherPlayer = getPlayerStatus(otherSocket);
      otherSocket.emit('message', `You are connected as ${otherPlayer}.`);
    });
  });

  socket.on('click', pos => {
    console.log(
      `Socket ${socket.id} clicked on quadrant ${pos.x}, ${pos.y}`);

    if(socket.id === getPlayerSocket(1).id)
      gameState[pos.y * 3 + pos.x] = 1;
    else if(socket.id === getPlayerSocket(2).id)
      gameState[pos.y * 3 + pos.x] = 2;

    sioServer.sockets.emit('state', gameState);
    turn++;
  });

  socket.on('clear', () => {
    gameState = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    turn = 0;
    sioServer.sockets.emit('state', gameState);
  });
});
