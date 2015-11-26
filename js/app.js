//
// Game
//

// it's getting a little muddied up so want to declare some constants and
// resuable functions - should make things easier to read later.
// the reworking was a nightmare - but threw up some essential fixes!

var Game = function(){
  this.gameOn = false;
  this.startScreen = true;
  this.gameOver = false;
  this.paused = true;
  this.tileWidth = 101;
  this.tileHeight = 171;
  this.rowHeight = 83;
  this.rowCenterY = 21;
  this.numRows = 6;
  this.numCols = 5;
};

// isStartScreen
// isGameOn
// isPaused.... maybe

Game.prototype.isGameOver = function (gameOver) {
  if (gameOver) {
    this.gameOver = gameOver;
    this.gameOn = false;
    this.startScreen = false;
    this.paused = true;
    gameOverScreen.show = game.gameOver;
  }
};

Game.prototype.isPaused = function (pause) {
  if (pause) {
    this.gameOver = false;
    this.gameOn = false;
    this.startScreen = false;
    this.paused = pause;
    gamePausedScreen.show = this.paused;
  }
};

Game.prototype.startNewGame = function () {
  this.playerLives = 3;
  this.paused = false;
  player = new Player();
  scoreBoard = new ScoreBoard();
};

Game.prototype.randomise = function (first, last) {
  // Random number generator within a specified range
  var randomNum = Math.floor(Math.random() * (last - first + 1) + first);
  return randomNum;
};


//
// Enemy class
//

// Enemies our player must avoid
var Enemy = function() {
  // Variables applied to each of our instances go here,
  // we've provided one for you to get started

  // The image/sprite for our enemies, this uses
  // a helper we've provided to easily load images

  // all bugs enter from left off canvas
  this.x = - game.tileWidth;

  // aesthetic offset - is now game.rowCenterY
  // this.offsetY = 21;

  // randomise row between 1 and 3. Math.floor(Math.random()*(max-min+1)+min);
  // stone row heights = 83 centre is 42
  // offset y so that bug runs centrally 21 works...

  //this.y = Math.floor(Math.random() * 3 + 1) * 83 - 21;
  this.y = game.randomise(1, 3) * game.rowHeight - game.rowCenterY ;

  // tile size if necessary
   this.width = game.tileWidth;
   this.height = game.tileHeight;

  // sprite target dimensions (actual = 101 * 171) (x from 11 to 87, y from 87 to 131)

  this.hitWidth = 75;
  this.hitHeight = 44; // required for depth of bug

  // hit zone x offset for visible entity, enemy already centered in row y direction
  this.hitX = 11;

  // bug speed - want randomised 3, slow (1), med(2), fast(3)

  var minSpeed = 100;
  //var maxSpeed = 256;
  //this.speed = Math.floor(Math.random()*(maxSpeed - minSpeed + 1) + minSpeed);
  this.speed = game.randomise(1, 3) * minSpeed;

  this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
  // You should multiply any movement by the dt parameter
  // which will ensure the game runs at the same speed for
  // all computers.
  // the new x position = old x + distance traveled in timeframe
  this.x = this.x + this.speed * dt;
  if (this.checkCollisions()) {
    game.playerLives --;
    if (game.playerLives === 0) {
      return game.isGameOver(true);
    }
    scoreBoard.score --;
    player.reset();
    this.x = this.reset();

  }
  if (this.x > 505) {
    this.x = this.reset();
  }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Enemy reset. delete from array once off screen
// if enemies less than specific number create new one.
Enemy.prototype.reset = function() {
  var minEnemies = 3;
  var i = allEnemies.indexOf(this);
  if (i != -1) {
    allEnemies.splice(i, 1);
    if (allEnemies.length < minEnemies) {
      allEnemies.push(new Enemy());
    }
  }
};


//Enemy.prototype.checkCollisions = function(x, y, w, h, x2, y2, w2, h2) {};

// old

// Enemy.prototype.checkCollisions = function() {
//   if (this.x < player.x + 15 + player.width &&
//     this.x + this.width > player.x + 15 &&
//     this.y - 26 < player.y - 31 + player.height &&
//     this.height + this.y - 26 > player.y - 31) {
//     // collision detected!
//     return true;
//   }
//   return false;
// };


// new
Enemy.prototype.checkCollisions = function() {
    if (this.x + this.hitX < player.x + player.hitX + player.hitWidth &&
        this.x + this.hitX + this.hitWidth > player.x + player.hitX &&
        this.y < player.y + player.hitHeight &&
        this.hitHeight + this.y > player.y) {
    // collision detected!
    return true;
  }
  return false;
};


//
// Player class
//

var Player = function() {
  // target sprite dimensions (actual = 101 * 171)
  this.hitWidth = 70;
  this.hitHeight = 80;

  // hit zone x offset for visible entity, enemy already centered in row y direction
  this.hitX = 15;

  //this.score = 0;
  this.reset();
  this.sprite = 'images/char-boy.png';
};

Player.prototype.update = function() {
  // tbd
};

Player.prototype.render = function(){
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function(keyPress){
  // want to move player by one tile in relevant direction
  // when player reaches water add 1 point and reset start

  if (game.startScreen) {
    switch (keyPress) {
      case 'space':
      game.startScreen = false;
      game.gameOn = true;
      gameInfo.show = game.startScreen;
      game.startNewGame();
      break;
      default:
      return; // do nothing
    }

  } else if (game.gameOver){
    switch (keyPress) {
      case 'space':
      game.gameOver = false;
      game.gameOn = true;
      gameOverScreen.show = game.gameOver;
      game.startNewGame();
      break;
      case 'i':
      gameInfo.showScreen();
      break;
      default:
      return; // do nothing
    }

  } else if (game.paused){
    game.paused = false;
    gamePausedScreen.show = false;
  } else {

    switch (keyPress) {
      case 'space': // if implement game pause
      game.paused = true;
      gamePausedScreen.show = true;
      break;
      case 'left':
      if (this.x - game.tileWidth < 0) {
        break;
      } else {
        this.x -= game.tileWidth;
        break;
      }
      case 'right':
      if (this.x + game.tileWidth >= 505) {
        break;
      } else {
        this.x += game.tileWidth;
        break;
      }
      case 'up':
      if (this.y - game.rowHeight < 0) {
        this.reset();
        scoreBoard.score ++;
        break;
      } else {
        this.y -= game.rowHeight;
        break;
      }
      case 'down':
      if (this.y + game.rowHeight > 394) {
        break;
      } else {
        this.y += game.rowHeight;
        break;
      }
      default:
      return;
    }
  }
};

Player.prototype.reset = function(dt) {
  // if reach water reset with same player
  // moved setting x and y position here.
  // sprite height = 171
  // col widths = 101
  // randomise col between 0 and 4.
  // Math.floor(Math.random() * (max - min + 1) + min);
  // player Start Y is grid height - sprite height - aesthetic offset = 394
  // this.offsetY = 21;
  this.x = game.randomise(0, 4) * game.tileWidth;
  this.y = (game.numRows - 1) * game.rowHeight - game.rowCenterY ;
};



//
// GameScreen class
//

// I'm going to try inheritance on this one
// child screens: GameInfo, GameOverScreen
// based on Stack Overflow answer from Juan Mendes
// http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
/**
* Draws a rounded rectangle using the current state of the canvas.
* If you omit the last three params, it will draw a rectangle
* outline with a 5 pixel border radius
* @param {CanvasRenderingContext2D} ctx
* @param {Number} x The top left x coordinate
* @param {Number} y The top left y coordinate
* @param {Number} width The width of the rectangle
* @param {Number} height The height of the rectangle
* @param {Number} [radius = 5] The corner radius; It can also be an object
*                 to specify different radii for corners
* @param {Number} [radius.tl = 0] Top left
* @param {Number} [radius.tr = 0] Top right
* @param {Number} [radius.br = 0] Bottom right
* @param {Number} [radius.bl = 0] Bottom left
* @param {Boolean} [fill = false] Whether to fill the rectangle.
* @param {Boolean} [stroke = true] Whether to stroke the rectangle.
*/

//
// GameScreen message template
//

var GameScreen = function() {
  // match size and position of initial game screen
  this.x = 0;
  this.y = 50;

  this.width = 505;
  this.height = 536;

  this.show = false;

};

GameScreen.prototype.render = function () {
  if (this.show) {
    this.drawScreen(this.x, this.y, this.width, this.height);
    this.infoText();
    game.paused = true;
  }
};

GameScreen.prototype.drawScreen = function (x, y, width, height) {
  var radius = 10;

  ctx.lineWidth = 10;
  ctx.strokeStyle = 'rgb(128, 0, 64)';
  ctx.fillStyle = 'rgba(255, 127, 0, 0.8)';

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

//
// Game Information Screen
//

var GameInfo = function(){
  this.titleText = 'How To Play';
  this.show = game.startScreen;
};

GameInfo.prototype = new GameScreen();

GameInfo.prototype.infoText = function () {
  var y = this.y;
  var lineHeight = 50;
  var lineExtraHeight = 70;
  ctx.font = '48pt Wendy One';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.fillText(this.titleText, this.width / 2, y += lineExtraHeight);
  ctx.font = '24pt Wendy One';
  ctx.fillText('Arrow keys move the player', this.width / 2, y += lineHeight);
  ctx.fillText('You have 3 lives', this.width / 2, y += lineHeight);
  ctx.fillText('Collect BLING for big points', this.width / 2, y += lineHeight);
  ctx.fillText('Rescue the Prince', this.width / 2, y += lineHeight);
  ctx.fillText('Lose a point if a BUG hits you', this.width / 2, y += lineHeight);
  ctx.fillText('-- !! and a LIFE !! --', this.width / 2, y += lineHeight);
  ctx.font = '48pt Wendy One';
  ctx.fillText('On y va!!', this.width / 2, y += lineExtraHeight);
  ctx.font = '24pt Wendy One';
  ctx.fillStyle = 'rgb(128, 0, 64)';
  ctx.fillText('Spacebar to PLAY or PAUSE', this.width / 2, y += lineHeight);
};

GameInfo.prototype.showScreen = function () {
  game.gameOver = false;
  game.gameOn = false;
  gameOverScreen.show = false;
  game.startScreen = true;
  this.show = game.startScreen;
  this.render();
};


//
// Game Over Screen
//

var GameOverScreen = function(){
  this.x = 25;
  this.y = 200;
  this.width = 455;
  this.height = 250;
  this.titleText = 'GAME OVER';
  this.show = game.gameOver;
};

GameOverScreen.prototype = new GameScreen();

GameOverScreen.prototype.infoText = function () {
  var y = this.y;
  var lineHeight = 50;
  var lineExtraHeight = 70;
  ctx.font = '48pt Wendy One';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.fillText(this.titleText, this.width / 2 + 25, y += lineExtraHeight);
  ctx.font = '24pt Wendy One';
  ctx.fillText('Your Score: ' + scoreBoard.score, this.width / 2, y += lineHeight);
  ctx.fillStyle = 'rgb(128, 0, 64)';
  ctx.fillText('Press i for Info', this.width / 2 + 25, y += lineHeight);
  ctx.fillText('Spacebar to RESTART', this.width / 2 + 25, y += lineHeight);
};

//
// Game Paused Screen
//

var GamePausedScreen = function(){
  this.x = 25;
  this.y = 200;
  this.width = 455;
  this.height = 150;
  this.titleText = 'PAUSED';
  this.show = false;
};

GamePausedScreen.prototype = new GameScreen();

GamePausedScreen.prototype.infoText = function () {
  var y = this.y;
  var lineHeight = 50;
  var lineExtraHeight = 70;
  ctx.font = '48pt Wendy One';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.fillText(this.titleText, this.width / 2 + 25, y += lineExtraHeight);
  ctx.font = '24pt Wendy One';
  //ctx.fillText('Your Score: ' + scoreBoard.score, this.width / 2, y += lineHeight);
  ctx.fillStyle = 'rgb(128, 0, 64)';
  //ctx.fillText('Press i for Info', this.width / 2 + 25, y += lineHeight);
  ctx.fillText('Spacebar to CONTINUE', this.width / 2 + 25, y += lineHeight);
};



//
// scoreboard
//

// feel need to separate the scoreboard from the player

var ScoreBoard = function(){
  this.x = 10;
  this.lifeX = 192; // to centre on screen based on 3 lives
  this.y = 40;
  this.lifeY = -10; // to take account of blank space at top
  this.score = 0;
  this.sprite = 'images/Heart.png';
};

ScoreBoard.prototype.render = function () {
  // scoreboard
  ctx.font = '30pt Wendy One';
  ctx.fillStyle = 'orange';
  ctx.strokeStyle = 'red';
  ctx.clearRect(0, 0, 505, 50);
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + this.score, this.x, this.y);

  // lives
  // heart image 101 x 171
  // main area from y = 40 to 141
  // x is ok at game.tileWidth
  // render at less than half size align right if possible
  // ctx.drawImage(image, dx, dy, dWidth, dHeight);
  var spriteHeart = Resources.get(this.sprite);
  var spriteWidth = spriteHeart.width * 0.4;
  var spriteHeight = spriteHeart.height * 0.4;
  // render one for each life
  for (var i = 0; i < game.playerLives; i++) {
    //array[i] maybe i'll need an array of lives.
    ctx.drawImage(spriteHeart, this.lifeX + i * spriteWidth, this.lifeY, spriteWidth, spriteHeight);
    //console.log((505 - spriteWidth * 3) / 2);
  }
};

//
// Bling class
//

// Bling our player must collect
var Bling = function() {
  // Draw the bling - smaller - it is huge!
  this.shrink = 0.6;

  // size for bling when picked up
  this.shrinkMore = 0.3;

  // bling picked up and saved
  this.picked = false;
  this.saved = false;

  // sprite dimensions (might also work as hit dimensions)
  if (this.picked) {
    this.width = game.tileWidth * this.shrinkMore;
    this.height = game.tileHeight * this.shrinkMore;
  } else {
    this.width = game.tileWidth * this.shrink;
    this.height = game.tileHeight * this.shrink;
  }

  // offset to centre bling on tile
  this.offsetX = (game.tileWidth - this.width) / 2;
  //this.offsetY = (game.tileHeight - this.height) / 2;
  // offsetY = 21 seems to work best again :)
  // this.offsetY = 21;

  // bling to appear in random places (same rows as bugs)
  this.x = game.randomise(0, 4) * game.tileWidth + this.offsetX;
  this.y = game.randomise(1, 3) * game.rowHeight + game.rowCenterY ;

  // bling to time out or turn into imprenatable rock

  // select random gem from array - just one for now

  var colour = ['blue', 'green', 'orange'];
  this.gem = 'images/gem-' + colour[Math.floor(Math.random() * 3)] + '.png';
};


Bling.prototype.render = function() {
  if (this.picked) {
    console.log('collision: player at:' + player.x + 'bling at: ' + this.x);
    ctx.drawImage(Resources.get(this.gem), player.x, player.y, this.width, this.height);
  } else {
    ctx.drawImage(Resources.get(this.gem), this.x, this.y, this.width, this.height);
  }

};

Bling.prototype.update = function() {
  // tbd
};

//
// instantiate objects
//

var game = new Game();
var allEnemies = [new Enemy(), new Enemy(), new Enemy()];
var player = new Player();
var scoreBoard = new ScoreBoard();
var gameInfo = new GameInfo();
var gameOverScreen = new GameOverScreen();
var gamePausedScreen = new GamePausedScreen();
var bling = [new Bling(), new Bling()];




// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
  var allowedKeys = {
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    73: 'i'
  };

  player.handleInput(allowedKeys[e.keyCode]);
});
