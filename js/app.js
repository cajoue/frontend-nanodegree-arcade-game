//************************
// Game
//************************

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
  this.rowCenterY = 21; // offset so that bugs run in centre of row
  this.numRows = 6;
  this.numCols = 5;
  this.minBling = 3; // number of gems in play
};

//------------------------
// Game.isGameOver()
//------------------------

// all lives lost and game is over
Game.prototype.isGameOver = function (gameOver) {
  if (gameOver) {
    this.gameOver = gameOver;
    this.gameOn = false;
    this.startScreen = false;
    this.paused = true;
    gameOverScreen.show = game.gameOver;
  }
};

//------------------------
// Game.isPaused(pause)
//------------------------

// spacebar has been pressed to pause game
Game.prototype.isPaused = function (pause) {
  if (pause) {
    this.gameOver = false;
    this.gameOn = false;
    this.startScreen = false;
    this.paused = pause;
    gamePausedScreen.show = this.paused;
  }
};

//------------------------
// Game.startNewGame()
//------------------------

// Start a new game
Game.prototype.startNewGame = function () {
  this.playerLives = 3;
  this.paused = false;
  player = new Player();
  scoreBoard = new ScoreBoard();
};

//------------------------
// Game.randomise(first, last)
//------------------------

// Random number generator within a specified range
Game.prototype.randomise = function (first, last) {
  var randomNum = Math.floor(Math.random() * (last - first + 1) + first);
  return randomNum;
};


//************************
// Enemy class
//************************

// Enemies our player must avoid
var Enemy = function() {
  // all bugs enter from left off canvas
  this.x = - game.tileWidth;
  // bugs run in random row
  this.y = game.randomise(1, 3) * game.rowHeight - game.rowCenterY ;

  // tile size if necessary
   this.width = game.tileWidth;
   this.height = game.tileHeight;

  // sprite target dimensions (visible part of tile)
  this.hitWidth = 75;
  this.hitHeight = 44;  // required for depth of bug
  this.hitX = 11;       // x offset for visible part of tile

  // bug speed - want randomised 3, slow (1), med(2), fast(3)
  var minSpeed = 100; // may increase if implement levels
  this.speed = game.randomise(1, 3) * minSpeed;

  this.sprite = 'images/enemy-bug.png';
};

//------------------------
// Enemy.update(dt)
//------------------------

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
  // You should multiply any movement by the dt parameter
  // which will ensure the game runs at the same speed for
  // all computers.

  // the new x position = old x + distance traveled in timeframe
  this.x = this.x + this.speed * dt;

  // checkCollisions to see if hit player TODO: or player carrying gem
  if (this.checkCollisions()) {
    game.playerLives --;            // lose a life
    if (game.playerLives === 0) {   // gameOver
      return game.isGameOver(true);
    }
    scoreBoard.score --;            // lose a point
    player.reset();                 // reset player
    this.x = this.reset();          // reset this bug
  }
  if (this.x > 505) {               // if out of bounds reset bug
    this.x = this.reset();
  }
};

//------------------------
// Enemy.render()
//------------------------

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//------------------------
// Enemy.reset()
//------------------------

// Enemy reset. delete from array once off screen
Enemy.prototype.reset = function() {
  var minEnemies = 3;                     // may increase if implement levels
  var i = allEnemies.indexOf(this);       // find this instance of bug
  if (i != -1) {
    allEnemies.splice(i, 1);              // delete it
    if (allEnemies.length < minEnemies) {
      allEnemies.push(new Enemy());       // push new bug to array
    }
  }
};


//------------------------
// Enemy.checkCollisions()
//------------------------

//Enemy.prototype.checkCollisions = function(x, y, w, h, x2, y2, w2, h2) {};
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


//************************
// Player class
//************************

var Player = function() {
  // target sprite dimensions (visible area)
  this.hitWidth = 70;
  this.hitHeight = 80;
  this.hitX = 15;     // x offset for visible area
  this.reset();       // setting for new player
  this.sprite = 'images/char-boy.png';  // may change if implement levels
};

//------------------------
// Player.update()
//------------------------

Player.prototype.update = function() {
  // tbd
};

//------------------------
// Player.render()
//------------------------

Player.prototype.render = function(){
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//------------------------
// Player.handleInput(keyPress)
//------------------------

Player.prototype.handleInput = function(keyPress){
  // want to move player by one tile in relevant direction
  // when player reaches water add 1 point and reset start position

  // press spacebar to startNewGame from startScreen
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

  // press spacebar to startNewGame from gameOverScreen
  } else if (game.gameOver){
    switch (keyPress) {
      case 'space':
      game.gameOver = false;
      game.gameOn = true;
      gameOverScreen.show = game.gameOver;
      game.startNewGame();
      break;

      // press i to show startScreen information from gameOverScreen
      case 'i':
      gameInfo.showScreen();
      break;
      default:
      return; // do nothing
    }

  // press spacebar to unpause game from gamePausedScreen
  } else if (game.paused){
    game.paused = false;
    gamePausedScreen.show = false;
  } else {

    switch (keyPress) {
      case 'space':       // to pause game
      game.paused = true;
      gamePausedScreen.show = true;
      break;
      case 'left':        // to move left in bounds
      if (this.x - game.tileWidth < 0) {
        break;
      } else {
        this.x -= game.tileWidth;
      }
      break;
      case 'right':       // to move right in bounds
      if (this.x + game.tileWidth >= 505) {
        break;
      } else {
        this.x += game.tileWidth;
      }
      break;
      case 'up':          // to move up in bounds, reach water, reset position
      if (this.y - game.rowHeight < 0) {
        this.reset();
        scoreBoard.score ++;  // reached water add a point to score
        break;
      } else {
        this.y -= game.rowHeight;
      }
      break;
      case 'down':       // to move down in bounds
      if (this.y + game.rowHeight > 394) {
        break;
      } else {
        this.y += game.rowHeight;
      }
      break;
      default:
      return;
    }
  }
};

//------------------------
// Player.reset(dt)
//------------------------

Player.prototype.reset = function(dt) {
  // interact with gems
  this.hasBling = false;   // set true when carry bling
  this.dropsBling = false; // mostly false, lose bling if dropZone times out

  // randomise start position and centre in tile
  this.x = game.randomise(0, 4) * game.tileWidth;
  this.y = (game.numRows - 1) * game.rowHeight - game.rowCenterY;
};


//************************
// Bling class
//************************

// Bling our player must collect
var Bling = function() {
  // initial state of bling // TODO: maybe create an initiate method
  this.visible = false;
  this.shrink = 0.6;      // Draw the bling - smaller - it is huge!
  this.shrinkMore = 0.3;  // size for bling when picked up

  // bling picked up, dropped, delivered, collected
  this.picked = false;
  this.dropped = false;
  this.delivered = false;
  this.collected = false;     // if implement levels

  // delay appearance of bling
  this.delayMin = 20;
  this.delayMax = 200;
  this.delayCount = game.randomise(this.delayMin,this.delayMax);
  // for reset after delivery - fade time shorter than dropzone fade
  this.resetTime = 15;
  this.resetCount = this.resetTime;
  //this.reset();

  // sprite dimensions (might also work as hit dimensions)
  this.width = game.tileWidth * this.shrink;
  this.height = game.tileHeight * this.shrink;
  // offset to centre bling on tile
  this.offsetX = (game.tileWidth - this.width) / 2;
  // hitHeight defined for collisions with player
  this.hitHeight = 40;

  // sprite dimensions if (this.picked)
  this.pickWidth = game.tileWidth * this.shrinkMore;
  this.pickHeight = game.tileHeight * this.shrinkMore;
  // offset to position picked up bling
  this.pickX = (game.tileWidth - this.pickWidth) / 2;
  this.pickY = (this.height);

  // bling to appear in random places (same rows as bugs)
  this.x = game.randomise(0, 4) * game.tileWidth + this.offsetX;
  this.y = game.randomise(1, 3) * game.rowHeight + game.rowCenterY ;

  // select random gem from array
  // want greater number of blues to greens to oranges
  var colour = ['blue', 'blue', 'blue', 'green', 'green', 'orange'];
  this.gem = 'images/gem-' + colour[game.randomise(0, 5)] + '.png';

  // ideas: //
  // bling to time out (kind of does as is linked to dropZone)
  // or turn into impenetrable rock blocking part of grid
};

//------------------------
// Bling.render()
//------------------------

Bling.prototype.render = function() {
  // render when made visible after initial delay
  if (this.visible) {
    if (this.picked) {
      // player carries smallest gem size
      ctx.drawImage(Resources.get(this.gem), player.x + this.pickX, player.y + this.pickY, this.pickWidth, this.pickHeight);
    } else if (this.delivered) {
      // gem takes the player location as its own position
      ctx.drawImage(Resources.get(this.gem), dropZone.x + this.offsetX, dropZone.y, this.width, this.height);
    } else {
      // regular state
      ctx.drawImage(Resources.get(this.gem), this.x, this.y, this.width, this.height);
    }
  }
};

//------------------------
// Bling.update()
//------------------------

Bling.prototype.update = function() {
  // begin checkCollisions
  if (this.checkCollisions()) {
    // checkCollisions interaction with player - picked
    if (this.picked){
      dropZone.show();
    }
    // checkCollisions interaction with dropZone - delivered
    // start resetTime, increase score, set picked to false,
    // TODO: ?? set delivered to false ??
    if (this.delivered) {
      this.picked = false;
      scoreBoard.score += 10;
      this.resetCount = this.resetTime;
    }
    // TODO:
    // if is dropped (hit by bug or in water or dropZone timed out)
    if (this.dropped) {
      this.picked = false;
      dropZone.reset();
      this.reset();
      console.log('bling.update: checkCollisions true: dropped: true');
    }
  } // end checkCollisions

  // start check timeout to release gem after delivery (it just looks nicer)
  if (this.delivered) {
    if (this.resetCount > 1) {
      this.resetCount --;
    } else if (this.resetCount === 1) {
      this.resetCount --;
      this.reset();
    } else {
      this.reset();
    }
  }

  // timer to display bling after a random delay
  if (!this.visible && this.delayCount > 0) {
    this.delayCount --;
  } else {
    this.visible = true;
  }

  // has player dropped gem?
  // dropZone timeout
  if (this.picked && player.dropsBling) {
    this.picked = false;
    dropZone.reset();
    this.reset();
    console.log('bling.update: bling.picked && player.dropsBling > bling.picked: false, drop reset, bling reset, player.dropsBling: false;');
    player.dropsBling = false;
  }
};

//------------------------
// Bling.checkCollisions()
//------------------------
//TODO: rework this code into cases
// Even though bling is static, check for player bumping into it as it is an array item
Bling.prototype.checkCollisions = function() {

  // interactions with player
  // if player already holds a different instance of gem return false
  // player ignore bling
  if (!this.picked && player.hasBling) {
    console.log('bling.checkCollisions: !this.picked && player.hasBling > should not pick up bling');
    return false;
  } else if (!this.picked && !this.dropped && !this.delivered && !player.hasBling) {
    if (this.x < player.x + player.hitX + player.hitWidth &&
        this.x + this.width > player.x + player.hitX &&
        this.y < player.y + player.hitHeight &&
        this.hitHeight + this.y > player.y) {
      // collision detected!
      console.log('bling.checkCollisions: !this.picked && !this.dropped && !this.delivered > gem picked up');
      this.picked = true;
      player.hasBling = true;
      return true;
    }
    return false;
  } else if (this.picked && !this.dropped && !this.delivered && dropZone.visible) {
    // case for dropped in dropZone
    if (dropZone.x < player.x + player.hitX + player.hitWidth &&
        dropZone.x + dropZone.width > player.x + player.hitX &&
        dropZone.y < player.y + player.hitHeight &&
        dropZone.height + dropZone.y > player.y) {
      // collision detected!
      this.delivered = true;
      dropZone.dropReceived = true;
      player.hasBling = false;
      console.log('bling.checkCollisions: this.picked && !this.dropped && !this.delivered && dropZone.visible> gem delivered');
      return true;
    }
    return false;
  } else {
    // case for picked up but hit by bug before reach drop zone
    return false;
  }
};

//------------------------
// Bling.reset()
//------------------------

Bling.prototype.reset = function () {
  // find index of this instance and delete it
  var i = bling.indexOf(this);
  if (i != -1) {
    bling.splice(i, 1);

  // keep the bling array topped up with new bling
    while (bling.length < game.minBling) {
      bling.push(new Bling());
    }
  }
};

//------------------------
// Bling.show()
//------------------------

Bling.prototype.show = function () {
   this.visible = true;
};


//************************
// DropZone class
//************************

var DropZone = function() {
  // dropZone appears once a bling is picked up
  // deliver gem to dropZone before it disappears to earn points
  // initial states
  this.visible = false;
  this.showTime = 200; // for visibility timer
  this.showCount = 0;
  this.resetTime = 20; // for reset fade time
  this.resetCount = 0;
  this.dropReceived = false; // true when bling delivered here
  this.reset();

  // bling to appear in random places (grass rows)
  this.x = game.randomise(0, 4) * game.tileWidth;
  this.y = game.randomise(4, 5) * game.rowHeight + game.rowCenterY ;

  this.width = game.tileWidth;
  this.height = game.rowHeight;
  this.sprite = 'images/Selector.png';
};

//------------------------
// DropZone.render()
//------------------------

DropZone.prototype.render = function() {
  if (this.visible) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y, this.width, this.height);
  }
};

//------------------------
// DropZone.update()
//------------------------

DropZone.prototype.update = function() {
  // visibility from gem pickup to delivery or timeout
  if (this.visible && !this.dropReceived && this.showCount > 1) {
    this.showCount --;

    // if player doesn't reach dropZone in time
  } else if (this.visible && !this.dropReceived && this.showCount === 1) {
    player.dropsBling = true;
    player.hasBling = false;
    this.showCount --;
    dropZone = new DropZone();
    console.log('dropZone.update: this.visible && !this.dropReceived && this.showCount === 1 > player drops bling and dropZone reset');

    // fade out time from delivery to reset dropZone
  } else if (this.visible && this.resetCount > 1) {
    this.resetCount --;

    // still visible til reset dropZone at last moment
  } else if (this.visible && this.resetCount === 1) {
    this.resetCount --;
    dropZone = new DropZone();
    console.log('dropZone.update: this.visible && this.resetCount === 1 > dropZone reset');
    // not visible
  } else {
    this.visible = false;
  }
};

//------------------------
// DropZone.reset()
//------------------------
// TODO: ?? maybe just do new instance ??
DropZone.prototype.reset = function () {
  this.resetCount = this.resetTime;
  this.showCount = this.showTime;
};

//------------------------
// DropZone.show()
//------------------------

DropZone.prototype.show = function () {
   this.visible = true;
};


//************************
// GameScreen class
//************************

// I'm going to try inheritance on this one
// child screens: GameInfo, GameOverScreen
// based on Stack Overflow answer from Juan Mendes
// http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
/*
* Draws a rounded rectangle using the current state of the canvas.
* If you omit the last three params, it will draw a rectangle
* outline with a 5 pixel border radius
*/


//************************
// GameScreen message template
//************************

var GameScreen = function() {
  // match size and position of initial game screen
  this.x = 0;
  this.y = 50;

  this.width = 505;
  this.height = 536;

  this.show = false;
};

//------------------------
// GameScreen.render()
//------------------------

GameScreen.prototype.render = function () {
  if (this.show) {
    this.drawScreen(this.x, this.y, this.width, this.height);
    this.infoText();
    game.paused = true;
  }
};

//------------------------
// GameScreen.drawScreen(x, y, width, height)
//------------------------

// draws rounded rectangle of given size
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


//************************
// Game Information Screen
//************************

// this is the information startScreen
var GameInfo = function(){
  this.titleText = 'How To Play';
  this.show = game.startScreen;
};

//------------------------
// GameInfo.constructor()
//------------------------

GameInfo.prototype = new GameScreen();

//------------------------
// GameInfo.infoText()
//------------------------

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

//------------------------
// GameInfo.showScreen()
//------------------------

GameInfo.prototype.showScreen = function () {
  game.gameOver = false;
  game.gameOn = false;
  gameOverScreen.show = false;
  game.startScreen = true;
  this.show = game.startScreen;
  this.render();
};


//************************
// Game Over Screen
//************************

var GameOverScreen = function(){
  this.x = 25;
  this.y = 200;
  this.width = 455;
  this.height = 250;
  this.titleText = 'GAME OVER';
  this.show = game.gameOver;
};

//------------------------
// GameOverScreen.constructor()
//------------------------

GameOverScreen.prototype = new GameScreen();

//------------------------
// GameOverScreen.infoText()
//------------------------

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


//************************
// Game Paused Screen
//************************

var GamePausedScreen = function(){
  this.x = 25;
  this.y = 200;
  this.width = 455;
  this.height = 150;
  this.titleText = 'PAUSED';
  this.show = false;
};

//------------------------
// GamePausedScreen.constructor()
//------------------------

GamePausedScreen.prototype = new GameScreen();

//------------------------
// GamePausedScreen.infoText()
//------------------------

GamePausedScreen.prototype.infoText = function () {
  var y = this.y;
  var lineHeight = 50;
  var lineExtraHeight = 70;
  ctx.font = '48pt Wendy One';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.fillText(this.titleText, this.width / 2 + 25, y += lineExtraHeight);
  ctx.font = '24pt Wendy One';
  ctx.fillStyle = 'rgb(128, 0, 64)';
  ctx.fillText('Spacebar to CONTINUE', this.width / 2 + 25, y += lineHeight);
};


//************************
// scoreboard
//************************

var ScoreBoard = function(){
  this.x = 10;
  this.lifeX = 200; // to centre on screen based on 3 lives
  this.y = 40;
  this.lifeY = -10; // to take account of blank space at top
  this.score = 0;
  this.sprite = 'images/Heart.png';
};

//------------------------
// ScoreBoard.render()
//------------------------

ScoreBoard.prototype.render = function () {
  // scoreboard
  ctx.font = '30pt Wendy One';
  ctx.fillStyle = 'orange';
  ctx.strokeStyle = 'red';
  ctx.clearRect(0, 0, 505, 50);
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + this.score, this.x, this.y);

  // show lives remaining
  var spriteHeart = Resources.get(this.sprite);
  var spriteWidth = spriteHeart.width * 0.4;
  var spriteHeight = spriteHeart.height * 0.4;
  // render one for each life
  for (var i = 0; i < game.playerLives; i++) {
    ctx.drawImage(spriteHeart, this.lifeX + i * spriteWidth, this.lifeY, spriteWidth, spriteHeight);
  }
};


//************************
// instantiate objects
//************************

var game = new Game();
var allEnemies = [new Enemy(), new Enemy(), new Enemy()];
var player = new Player();
var scoreBoard = new ScoreBoard();
var gameInfo = new GameInfo();
var gameOverScreen = new GameOverScreen();
var gamePausedScreen = new GamePausedScreen();
var bling = [new Bling(), new Bling()];
var dropZone = new DropZone();


//************************
// event listener
//************************

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
