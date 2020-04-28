const ONGOING = 0;
const FINISHED = 1;
const TERMINATED = 2;

class Game {

  constructor(player1, player2){
    this.player1 = player1;
    this.player2 = player2;
    this.welcome();
    this.reset();
  }

  welcome(){
    this.player1.emit('message',
      `You are player 1, and your rival has ID ${this.player2.id}`);
    this.player2.emit('message',
      `You are player 2, and your rival has ID ${this.player1.id}`);
  }

  reset(){
    this.state = ONGOING;
    this.gameState = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.turn = 0;
    this.sendState();
  }

  update(playerId, x, y){
    if(!this.state === ONGOING) return;
    let player = this.getPlayer(playerId);

    if(!this.isFree(x, y)){
      this.msgPlayer(playerId, 'This square is already filled.');
      return;
    }

    if(player === 1 && this.turn % 2 === 0)
      this.fill(x, y, player);
    else if(player === 2 && this.turn % 2 === 1)
      this.fill(x, y, player);
    else {
      this.msgPlayer(playerId, 'It is not your turn.');
      return;
    }

    this.sendState();
    this.checkWin();
    this.turn++;
  }

  fill(x, y, playerId){
    this.gameState[y * 3 + x] = playerId;
  }

  isFree(x, y){
    return this.gameState[y * 3 + x] === 0;
  }

  msgPlayer(playerId, msg){
    if(this.player1.id === playerId)
      this.player1.emit('message', msg);
    else if(this.player2.id === playerId)
      this.player2.emit('message', msg);
  }

  getPlayer(playerId){
    if(playerId === this.player1.id)
      return 1;
    if(playerId === this.player2.id)
      return 2;
  }

  sendState(){
    this.player1.emit('state', this.gameState);
    this.player2.emit('state', this.gameState);
  }

  checkWin(){
    const winner = this.getWinner();

    if(winner <= 0) return;
    this.state = FINISHED;

    if(winner === 1){
      this.player1.emit('message', 'Congratulations, you won!');
      this.player2.emit('message', 'You lost!');
    } else{
      this.player2.emit('message', 'Congratulations, you won!');
      this.player1.emit('message', 'You lost!');
    }
  }

  getWinner(){
    if(this.turn < 4) return 0;
    const gs = this.gameState;

    for(let i = 0; i < 3; i++){
      for(let j = 0; j < 3; j++){
        if(gs[i*j] === gs[i*j + 1] && gs[i*j + 1] === gs[i*j + 2] 
          && gs[i*j] > 0)
          return gs[i*j];
        if(gs[i] === gs[i + j*1] && gs[i + j*1] === gs[i + j*2] 
          && gs[i] > 0)
          return gs[i*j];
      }
    }
  }
}

module.exports = Game;
