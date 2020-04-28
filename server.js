const CONFIG = require('./config');
const Game = require('./game');
const express = require('express');
const http = require('http');
const socket_io = require('socket.io');
const path = require('path');

// Servers setup
const app = express();
app.disable('x-powered-by');

const server = http.createServer(app);
const sioServer = socket_io(server);

server.listen(CONFIG.port, () => 
  console.log(`Express server listening on port ${CONFIG.port}...`));

// Player/Game management
let games = [];
let queue = [];

function alocatePlayers(){
  while(queue.length >= 2){
    games.push(new Game(queue[0], queue[1]));
    queue.splice(0, 2);
  }
}

function findGame(playerId){
  return games.findIndex(game => 
    (game.player1.id === playerId || game.player2.id === playerId));
}

function removeDisconnected(playerId){
  let gameIdx = findGame(playerId);

  if(gameIdx === -1){
    let idx = queue.findIndex(client => client.id === playerId);
    if(idx === -1){
      console.log('There is no client with ID: ', playerId);
      return;
    }
    queue.splice(idx, 1);
  } else{
    let game = games[gameIdx];
    game.reset();
    let otherPlayer = null;

    if(game.player1.id !== playerId)
      otherPlayer = game.player1;
    else if(game.player2 !== playerId)
      otherPlayer = game.player2;

    queue.push(otherPlayer);
    otherPlayer.emit('terminate');
    otherPlayer.emit('message', 
      `Player ${playerId} disconnected. Waiting for new partner...`);
    games.splice(gameIdx, 1);
  }
}

// Routes
app.use(express.static(CONFIG.publicDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, CONFIG.publicDir, 'index.html'));
});

app.get('/js/config.js', (req, res) => {
  res.set('Content-Type', 'application/javascript');
  res.send(`const PORT = ${CONFIG.port};`);
});

// Sockets
sioServer.on('connection', (socket) => {
  console.log(`Client ${socket.id} connected.`);
  socket.emit('message', 
    `Hello, your ID is ${socket.id}. Waiting for a partner...`);
  queue.push(socket);
  alocatePlayers();

  socket.on('disconnect', () => {
    console.log(`Client ${socket.id} disconnected.`);
    removeDisconnected(socket.id);
  });

  socket.on('click', pos => {
    console.log(
      `Client ${socket.id} clicked on quadrant ${pos.x}, ${pos.y}`);

    idx = findGame(socket.id);
    if(idx !== -1) games[idx].update(socket.id, pos.x, pos.y);
  });

  socket.on('clear', () => {
    idx = findGame(socket.id);
    if(idx !== -1) games[idx].reset();
  });
});
