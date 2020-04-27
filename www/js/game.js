let divMsg = document.getElementById('messages');
let canvas = document.getElementById('screen');
let ctx = canvas.getContext('2d');

let socket = io('http://localhost:3000');

socket.on('connect', () => {
  logMessage('Socket connected!');
});

const SCREEN_W = canvas.width;
const SCREEN_H = canvas.height;
const BOARD = {
  x: 100,
  y: 100,
  tile: 150
};

console.log(SCREEN_W);

canvas.onmousemove = (event) => {
//  divMsg.innerHTML += event.clientX + ' ' + event.clientY + '; '
  ctx.clearRect(0, 0, SCREEN_W, SCREEN_H);
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
