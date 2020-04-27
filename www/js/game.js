let divMsg = document.getElementById('messages');
let canvas = document.getElementById('screen');
let ctx = canvas.getContext('2d');
let imgCircle = document.createElement('img');
let imgCross = document.createElement('img');
imgCircle.src = 'res/img/circle.png';
imgCross.src = 'res/img/cross.png';

let gameState = [0, 0, 0, 0, 0, 0, 0, 0, 0];

let socket = io('http://localhost:3001');

socket.on('connect', () => {
  logMessage('Socket connected!');
});

socket.on('message', (msg) => {
  logMessage(msg);
});

socket.on('state', (state) => {
  logMessage(`State ${JSON.stringify(state)} received`);
  gameState = state;
  drawBoard();
});

const SCREEN_W = canvas.width;
const SCREEN_H = canvas.height;
const BOARD = {
  x: 100,
  y: 100,
  tile: 150
};

console.log(SCREEN_W);

function drawBoard(){
  ctx.clearRect(0, 0, SCREEN_W, SCREEN_H);

  for(let i = 0; i <= 2; i++){
    for(let j = 0; j <= 2; j++){
      let cell = gameState[j * 3 + i];

      if(cell === 1){ // draw X
        ctx.drawImage(imgCross, 
          BOARD.x + BOARD.tile * i, BOARD.y + BOARD.tile * j);
      } else if (cell === 2) { // draw O
        ctx.drawImage(imgCircle, 
          BOARD.x + BOARD.tile * i, BOARD.y + BOARD.tile * j);
      }
    }
  }
}

canvas.onmousemove = (event) => {
//  divMsg.innerHTML += event.clientX + ' ' + event.clientY + '; '
  drawBoard();
  quad = findQuadrant(event.clientX, event.clientY);

  if(quad){
    ctx.fillStyle = '#33333388';
    ctx.fillRect(BOARD.x + quad.x * BOARD.tile, 
      BOARD.y + quad.y * BOARD.tile, BOARD.tile, BOARD.tile);
  }
};

canvas.onclick = (event) => {
  quad = findQuadrant(event.clientX, event.clientY);

  if(quad) socket.emit('click', quad);
};

function logMessage(msg){
  divMsg.innerHTML += msg + '</br>';
}

function findQuadrant(x, y){
  let pos = {
    x: 0, 
    y: 0, 
  };

  if(x > BOARD.x && x <= (BOARD.x + BOARD.tile)){
    pos.x = 0;
  } else if(x > (BOARD.x + BOARD.tile) && x <= (BOARD.x + 2 * BOARD.tile)){
    pos.x = 1;
  } else if(x > (BOARD.x + 2 * BOARD.tile)&& x <= (BOARD.x + 3 * BOARD.tile)){
    pos.x = 2;
  } else return null;

  if(y > BOARD.y && y <= (BOARD.y + BOARD.tile)){
    pos.y = 0;
  } else if(y > (BOARD.y + BOARD.tile) && y <= (BOARD.y + 2 * BOARD.tile)){
    pos.y = 1;
  } else if(y > (BOARD.y + 2 * BOARD.tile)&& y <= (BOARD.y + 3 * BOARD.tile)){
    pos.y = 2;
  } else return null;

  return pos;
}
