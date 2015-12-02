//************************
// Game
//************************

var Game = function(){
  this.gameOn = false;
  this.startScreen = true;
  this.gameOver = false;
  this.paused = true;
  this.gameWon = false;
};

//------------------------
// Game CONSTANTS
//------------------------
Game.prototype.TILE_WIDTH = 101;
Game.prototype.TILE_HEIGHT = 171;
Game.prototype.ROW_HEIGHT = 83;
Game.prototype.ROW_CENTER_Y = 21; // offset so that bugs run in centre of row
Game.prototype.NUM_ROWS = 6;
Game.prototype.NUM_COLS = 5;
Game.prototype.MIN_BLING = 3;     // number of gems in play
Game.prototype.MIN_ENEMIES = 3;   // number of enemies in play
Game.prototype.PLAYER_LIVES = 3;
Game.prototype.LEVEL = 1;         // default game level
Game.prototype.WIN = 3;           // number of levels
Game.prototype.COLLECTION = 3;    // number of bling to collect
Game.prototype.DEFAULT_COLLECTIBLE = 'images/gem-blue.png';

//------------------------
// Game.isGameOver()
//------------------------

// all lives lost and game is over
Game.prototype.isGameOver = function (gameOver) {
  if (gameOver === true) {
    this.gameOver = gameOver;
    this.gameOn = false;
    this.startScreen = false;
    this.paused = true;
    gameOverScreen.show = this.gameOver;
  }
};

//------------------------
// Game.isPaused(pause)
//------------------------

// spacebar has been pressed to pause game
Game.prototype.isPaused = function (pause) {
  if (pause === true) {
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
  this.level = this.LEVEL;
  scoreBoard = new ScoreBoard();
  this.startNewLevel(this.level);
};

//------------------------
// Game.startNewLevel()
//------------------------

// Start a new game
Game.prototype.startNewLevel = function (level) {
  this.playerLives = this.PLAYER_LIVES;
  this.level = level;
  this.paused = false;
  scoreBoard.collection = 0;
  player = new Player();
  dropZone = new DropZone();
  allEnemies = [];
  bling = [];
  for(var i = 0; i < this.MIN_ENEMIES; i++) {
    allEnemies.push(new Enemy());
  }
  for(var i = 0; i < this.MIN_BLING; i++) {
    bling.push(new Bling());
  }
  gameLevelUpScreen = new GameLevelUpScreen(level);
  if (this.level === 2) {
    scoreBoard.collectible = 'images/gem-green.png';
    scoreBoard.collect = 'green';
  } else if (this.level === 3) {
    scoreBoard.collectible = 'images/gem-orange.png';
    scoreBoard.collect = 'orange';
  } else {
    scoreBoard.collectible = 'images/gem-blue.png';
    scoreBoard.collect = 'blue';
  }
};

//------------------------
// Game.isLevelComplete()
//------------------------

// has the player completed the level
Game.prototype.isLevelComplete = function (levelComplete) {
  if (levelComplete === true) {
    this.gameOver = false;
    this.gameOn = false;
    this.startScreen = false;
    this.paused = false;
    this.levelComplete = levelComplete;

    // has the player completed the final level
    if (this.level === this.WIN) {
      this.gameWon = true;
      this.levelComplete = false;
      gameWonScreen.show = this.gameWon;
    } else {
      gameLevelUpScreen.show = this.levelComplete;
    }
  }
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
  // tile size if necessary
  this.width = game.TILE_WIDTH;
  this.height = game.TILE_HEIGHT;

  this.sprite = 'images/enemy-bug.png';
  this.reset();
};

//------------------------
// Enemy CONSTANTS
//------------------------

// sprite target dimensions (visible part of tile)
Enemy.prototype.HIT_WIDTH = 75;
Enemy.prototype.HIT_HEIGHT = 44;  // required for depth of bug
Enemy.prototype.HIT_X = 11;       // x offset for visible part of tile
Enemy.prototype.MIN_SPEED = 100;  // slow speed for enemy bug

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

  // checkCollisions to see if hit player
  if (this.checkCollisions() === true) {
    if (player.hasBling === true) {
      scoreBoard.score -= 10;     // lose 10 points
      player.losesBling();        // drop bling
      dropZone.visible = false;
    } else {
      scoreBoard.score --;        // lose a point
    }

    game.playerLives --;            // lose a life
    if (game.playerLives === 0) {   // gameOver
      return game.isGameOver(true);
    }

    player.reset();                 // reset player
    this.reset();                   // reset this bug
  }

  if (this.x > 505) {               // if out of bounds reset bug
    this.reset();
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
  // all bugs enter from left off canvas
  this.x = - game.TILE_WIDTH;
  // bugs run in random row
  this.y = game.randomise(1, 3) * game.ROW_HEIGHT - game.ROW_CENTER_Y;
  // bug speed - want randomised 3, slow (1), med(2), fast(3)
  this.speed = game.randomise(1, 3) * this.MIN_SPEED;
};

//------------------------
// Enemy.checkCollisions()
//------------------------

Enemy.prototype.checkCollisions = function() {
    if (this.x + this.HIT_X < player.x + player.HIT_X + player.HIT_WIDTH &&
        this.x + this.HIT_X + this.HIT_WIDTH > player.x + player.HIT_X &&
        this.y < player.y + player.HIT_HEIGHT &&
        this.HIT_HEIGHT + this.y > player.y) {
    // collision detected!
    return true;
  }
  return false;
};


//************************
// Player class
//************************

var Player = function() {
  this.initial();       // setting for new player
};

//------------------------
// Player CONSTANTS
//------------------------

// target sprite dimensions (visible area)
Player.prototype.HIT_WIDTH = 70;
Player.prototype.HIT_HEIGHT = 80;
Player.prototype.HIT_X = 15;     // x offset for visible area

//------------------------
// Player.initial()
//------------------------

Player.prototype.initial = function() {
  // interact with gems
  this.hasBling = false;   // set true when carry bling
  this.dropsBling = false; // mostly false, lose bling if dropZone times out
  this.sprite = 'images/char-boy.png';  // may change if implement levels
  this.reset();       // start position for new player
};

//------------------------
// Player.update()
//------------------------

Player.prototype.update = function() {
  // didn't seem to need this other than to make engine.js happy
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
  if (game.startScreen === true) {
    switch (keyPress) {
      case 'space':
      game.startScreen = false;
      game.gameOn = true;
      gameInfo.show = game.startScreen;
      game.startNewGame();
      break;
      default:
      break; // do nothing
    }

  // press spacebar to startNewGame from gameOverScreen
  } else if (game.gameOver === true){
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
      break; // do nothing
    }

    // press spacebar to startNewGame from gameWonScreen
  } else if (game.gameWon === true){
      switch (keyPress) {
        case 'space':
        game.gameWon = false;
        game.gameOn = true;
        gameWonScreen.show = game.gameWon;
        game.startNewGame();
        break;

        // press i to show startScreen information from gameWonScreen
        case 'i':
        gameInfo.showScreen();
        break;
        default:
        break; // do nothing
      }

    // press spacebar to level up
  } else if (game.levelComplete === true){
    switch (keyPress) {
      case 'space':
      game.levelComplete = false;
      game.gameOn = true;
      gameLevelUpScreen.show = game.levelComplete;
      game.startNewLevel(game.level + 1);
      break;
      default:
      break; // do nothing
    }

  // press spacebar to resume game from gamePausedScreen
  } else if (game.paused === true){
    game.paused = false;
    gamePausedScreen.show = false;
  } else {

    switch (keyPress) {
      case 'space':       // to pause game
      game.paused = true;
      gamePausedScreen.show = true;
      break;
      case 'left':        // to move left in bounds
      if (this.x - game.TILE_WIDTH < 0) {
        break;
      } else {
        this.x -= game.TILE_WIDTH;
      }
      break;
      case 'right':       // to move right in bounds
      if (this.x + game.TILE_WIDTH >= 505) {
        break;
      } else {
        this.x += game.TILE_WIDTH;
      }
      break;
      case 'up':          // to move up in bounds, reach water, reset position
      if (this.y - game.ROW_HEIGHT < 0) {
        // don't jump in water with bling
        if (this.hasBling === true) {
          scoreBoard.score -= 5; // lose 10 points
          this.losesBling();      // drop bling
          dropZone.visible = false;
        } else {
          scoreBoard.score ++;     // reached water add a point to score
        }
        this.reset();
        break;
      } else {
        this.y -= game.ROW_HEIGHT;
      }
      break;
      case 'down':       // to move down in bounds
      if (this.y + game.ROW_HEIGHT > 394) {
        break;
      } else {
        this.y += game.ROW_HEIGHT;
      }
      break;
      default:
      break;
    }
  }
};

//------------------------
// Player.reset(dt)
//------------------------

Player.prototype.reset = function(dt) {
    // randomise start position and centre in tile
  this.x = game.randomise(0, 4) * game.TILE_WIDTH;
  this.y = (game.NUM_ROWS - 1) * game.ROW_HEIGHT - game.ROW_CENTER_Y;
};

//------------------------
// Player.losesBling
//------------------------

  // interact with gems
Player.prototype.losesBling = function() {
  this.hasBling = false;   // true when carry bling
  this.dropsBling = true; // mostly false, lose bling if dropZone times out
};


//************************
// Bling class
//************************

// Bling our player must collect
var Bling = function() {
  // sprite dimensions (might also work as hit dimensions)
  this.width = game.TILE_WIDTH * this.SHRINK;
  this.height = game.TILE_HEIGHT * this.SHRINK;
  // offset to centre bling on tile
  this.offsetX = (game.TILE_WIDTH - this.width) / 2;

  // sprite dimensions if (this.picked)
  this.pickWidth = game.TILE_WIDTH * this.SHRINKMORE;
  this.pickHeight = game.TILE_HEIGHT * this.SHRINKMORE;
  // offset to position picked up bling
  this.pickX = (game.TILE_WIDTH - this.pickWidth) / 2;
  this.pickY = (this.height);

  this.initial();

  // ideas: //
  // bling to time out (kind of does as is linked to dropZone)
  // or turn into impenetrable rock blocking part of grid
};

//------------------------
// Bling constants
// it appears that defining the constants outside the class works better
//------------------------

Bling.prototype.RESET_TIME = 15;    // reset after delivery - fade time shorter than dropzone fade
Bling.prototype.SHRINK = 0.6;      // Draw the bling - smaller - it is huge!
Bling.prototype.SHRINKMORE = 0.3;  // Resize for bling when picked up

Bling.prototype.DELAY_MIN = 100;   // delay appearance of bling
Bling.prototype.DELAY_MAX = 600;

// HIT_HEIGHT defined for collisions with player
Bling.prototype.HIT_HEIGHT = 40;      // moved to bling contants

// want greater number of blues to greens to oranges
Bling.prototype.COLOURS = ['blue', 'blue', 'blue', 'green', 'green', 'orange'];

//------------------------
// Bling.render()
//------------------------

Bling.prototype.render = function() {

  // render when made visible after initial delay
  if (this.visible === true) {
    if (this.picked === true) {
      // player carries smallest gem size
      ctx.drawImage(Resources.get(this.gem), player.x + this.pickX, player.y + this.pickY, this.pickWidth, this.pickHeight);
    } else if (this.delivered === true) {
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
  if (this.visible === true) {

  if (this.resetCount > 1) {
      this.resetCount --;
  } else

    if (this.resetCount === 1) {
      game.isLevelComplete(scoreBoard.collection === game.COLLECTION);
      this.resetCount --;
      this.delivered = false;
      this.reset();
    }

    // check if bling dropped by dZ timeout
    if (this.picked && player.dropsBling) {
      this.picked = false;
      player.dropsBling = false;
      dropZone.reset();
      this.reset();
    }

    switch (this.checkCollisions()) {
      // player picks up gem
      case 'pickup':
        this.picked = true;
        player.hasBling = true;
        dropZone.show();
        break;
      // gem has been deliverd to dropZone
      case 'delivered':
        this.picked = false;
        this.delivered = true;
        dropZone.dropReceived = true;
        player.hasBling = false;
        scoreBoard.score += 10;
        this.resetCount = this.RESET_TIME;
        if (this.colour === scoreBoard.collect) {
          scoreBoard.collection ++;
        }
        break;
      // gem has been dropped
      case 'dropped':
        // to be determined but possibly
        this.picked = false;
        this.dropped = true;
        dropZone.reset();
        this.reset();
        break;
      default:
        break;
    } // end of switch

  } // end of bling visible = true;
  // end checkCollisions

  // timer to display bling after a random delay
  if (!this.visible && this.delayCount > 0) {
    this.delayCount --;
  } else {
    this.visible = true;
  }
};

//------------------------
// Bling.checkCollisions()
// returns string: 'ignore' 'pickup' 'delivered' ...
//------------------------
// Even though bling is static, check for player bumping into it as it is an array item
Bling.prototype.checkCollisions = function() {
  // interactions with player
  // if player already holds a different instance of gem return false
  // player ignore bling
  // all conditions need to be false in order to pick up bling

  if (!this.delivered && !this.dropped && !player.dropsBling) {
    // conditions for delivery in dropZone
    if (this.picked && player.hasBling && dropZone.visible) {
      if (dropZone.x < player.x + player.HIT_X + player.HIT_WIDTH &&
          dropZone.x + dropZone.width > player.x + player.HIT_X &&
          dropZone.y < player.y + player.HIT_HEIGHT &&
          dropZone.height + dropZone.y > player.y) {
        // collision detected!
        return 'delivered';
      }
    } // end of delivery conditions

    // conditions for pickup
    if (!this.picked && !player.hasBling && !dropZone.dropReceived && !dropZone.visible) {
      if (this.x < player.x + player.HIT_X + player.HIT_WIDTH &&
          this.x + this.width > player.x + player.HIT_X &&
          this.y < player.y + player.HIT_HEIGHT &&
          this.HIT_HEIGHT + this.y > player.y) {
        // collision detected!
        return 'pickup';
      } else {
        return 'ignore';
      }
    } // end pickup conditions
  } // end these must be false
  return 'ignore';
}; // end checkCollisions

//------------------------
// Bling.reset()
//------------------------

Bling.prototype.reset = function () {
  // reset to randomise the bling position and color
  // reset all states too (visible, picked, timer etc)
  this.initial();
};

//------------------------
// Bling.initial()
//------------------------

Bling.prototype.initial = function () {
  // initial state of bling
  this.visible = false;

  // bling picked up, dropped, delivered, collected
  this.picked = false;
  this.dropped = false;
  this.delivered = false;
  this.collected = false;

  // delay appearance of bling
  this.delayCount = game.randomise(this.DELAY_MIN, this.DELAY_MAX);
  // for reset after delivery - fade time shorter than dropzone fade
  this.resetCount = 0;

  // bling to appear in random places (same rows as bugs)
  this.x = game.randomise(0, 4) * game.TILE_WIDTH + this.offsetX;
  this.y = game.randomise(1, 3) * game.ROW_HEIGHT + game.ROW_CENTER_Y ;

  // select random gem from array
  this.colour = this.COLOURS[game.randomise(0, 5)];
  this.gem = 'images/gem-' + this.colour + '.png';
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
  this.displayCount = 0;  // counter for fixed time display
  this.resetCount = 0;    // counter for fade out after delivery / timeout
  this.dropReceived = false; // true when bling delivered here
  this.reset();

  // bling to appear in random places (grass rows)
  this.x = game.randomise(0, 4) * game.TILE_WIDTH;
  this.y = game.randomise(4, 5) * game.ROW_HEIGHT + game.ROW_CENTER_Y ;

  this.width = game.TILE_WIDTH;
  this.height = game.ROW_HEIGHT;
  this.sprite = 'images/Selector.png';
};

//------------------------
// DropZone CONSTANTS
//------------------------

DropZone.prototype.DISPLAY_TIME = 200; // for visibility timer
DropZone.prototype.RESET_TIME = 20; // for reset fade time

//------------------------
// DropZone.render()
//------------------------

DropZone.prototype.render = function() {
  if (this.visible  === true) {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y, this.width, this.height);
  }
};

//------------------------
// DropZone.update()
//------------------------

DropZone.prototype.update = function() {
  // visibility from gem pickup to delivery or timeout
  if (this.visible && !this.dropReceived && this.displayCount > 1) {
    this.displayCount --;

    // if player doesn't reach dropZone in time
  } else if (this.visible && !this.dropReceived && this.displayCount === 1) {
    player.losesBling();
    this.displayCount --;
    dropZone = new DropZone();

    // fade out time from delivery to reset dropZone
  } else if (this.visible && this.resetCount > 1) {
    this.resetCount --;

    // still visible til reset dropZone at last moment
  } else if (this.visible && this.resetCount === 1) {
    this.resetCount --;
    dropZone = new DropZone();
    // not visible
  } else {
    this.visible = false;
  }
};

//------------------------
// DropZone.reset()
//------------------------

DropZone.prototype.reset = function () {
  this.resetCount = this.RESET_TIME;
  this.displayCount = this.DISPLAY_TIME;
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
  // have had to use Game.TILE_WIDTH as game.TILE_WIDTH throws error
  // same for Game.NUM_COLS and Game.LEVEL
  this.x = GameScreen.X;
  this.y = GameScreen.Y;
  this.width = game.TILE_WIDTH * game.NUM_COLS;
  this.height = GameScreen.HEIGHT;
  this.level = game.LEVEL;
  this.show = false;
};

//------------------------
// GameScreen CONSTANTS
//------------------------

GameScreen.X = 0;
GameScreen.Y = 50;
GameScreen.HEIGHT = 536;

//------------------------
// GameScreen.render()
//------------------------

GameScreen.prototype.render = function () {
  if (this.show  === true) {
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
  GameScreen.call(this);
  this.y = GameScreen.Y;
  this.titleText = 'How To Play';
  this.show = game.startScreen;
};


//------------------------
// GameInfo.constructor()
//------------------------

// from review
GameInfo.prototype = Object.create(GameScreen.prototype);
GameInfo.prototype.constructor = GameInfo;

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
  ctx.fillText('Stash BLING in the drop Zone', this.width / 2, y += lineHeight);
  ctx.fillText('Start with the BLUEs', this.width / 2, y += lineHeight);
//  ctx.fillText('Rescue the Prince', this.width / 2, y += lineHeight); // if i only had more time sweet prince.
  ctx.fillText('!! Lose a point if a BUG hits you !!', this.width / 2, y += lineHeight);
  ctx.fillText('! Also lose BLING and a LIFE !', this.width / 2, y += lineHeight);
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
  game.gameWon = false;
  game.gameOn = false;
  gameOverScreen.show = false;
  gameWonScreen.show = false;
  gameLevelUpScreen.show = false;
  game.startScreen = true;
  this.show = game.startScreen;
  this.render();
};


//************************
// Game Over Screen
//************************

var GameOverScreen = function(){
  GameScreen.call(this);
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

// from review
GameOverScreen.prototype = Object.create(GameScreen.prototype);
GameOverScreen.prototype.constructor = GameOverScreen;

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
  GameScreen.call(this);
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

GamePausedScreen.prototype = Object.create(GameScreen.prototype);
GamePausedScreen.prototype.constructor = GamePausedScreen;

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
// Game Level Up Screen
//************************

var GameLevelUpScreen = function(level){
  GameScreen.call(this);
  this.x = 25;
  this.y = 200;
  this.width = 455;
  this.height = 200;
  this.level = level;
  this.titleText = 'LEVEL ' + level + ' COMPLETE';
  this.show = game.levelComplete;
};

//------------------------
// GameLevelUp.constructor()
//------------------------

GameLevelUpScreen.prototype = Object.create(GameScreen.prototype);
GameLevelUpScreen.prototype.constructor = GameLevelUpScreen;

//------------------------
// GameLevelUp.infoText()
//------------------------

GameLevelUpScreen.prototype.infoText = function () {
  var y = this.y;
  var lineHeight = 50;
  var lineExtraHeight = 70;
  ctx.font = '36pt Wendy One';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.fillText(this.titleText, this.width / 2 + 25, y += lineExtraHeight);
  ctx.font = '24pt Wendy One';
  if (this.level === 1) {
    ctx.fillText('Now grab 3 GREEN Bling', this.width / 2 + 25, y += lineHeight);
  } else {
    ctx.fillText('Now stash 3 ORANGE Bling', this.width / 2 + 25, y += lineHeight);
  }
  ctx.fillStyle = 'rgb(128, 0, 64)';
  ctx.fillText('Spacebar to CONTINUE', this.width / 2 + 25, y += lineHeight);
};

//************************
// Game Won Screen
//************************

var GameWonScreen = function(){
  GameScreen.call(this);
  this.x = 25;
  this.y = 150;
  this.width = 455;
  this.height = 330;
  this.titleText = 'AWESOME!';
  this.show = game.gameWon;
};

//------------------------
// GameWonScreen.constructor()
//------------------------

GameWonScreen.prototype = Object.create(GameScreen.prototype);
GameWonScreen.prototype.constructor = GameWonScreen;

//------------------------
// GameWonScreen.infoText()
//------------------------

GameWonScreen.prototype.infoText = function () {
  var y = this.y;
  var lineHeight = 50;
  var lineExtraHeight = 70;
  ctx.font = '48pt Wendy One';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  ctx.fillText(this.titleText, this.width / 2 + 25, y += lineExtraHeight);
  ctx.fillText('YOU WON', this.width / 2 + 25, y += lineExtraHeight);
  ctx.font = '24pt Wendy One';
  ctx.fillText('Your Score: ' + scoreBoard.score, this.width / 2, y += lineHeight);
  ctx.fillStyle = 'rgb(128, 0, 64)';
  ctx.fillText('Press i for Info', this.width / 2 + 25, y += lineHeight);
  ctx.fillText('Spacebar to PLAY AGAIN', this.width / 2 + 25, y += lineHeight);
};


//************************
// scoreboard
//************************

var ScoreBoard = function(){
  this.initial();
};

//------------------------
// ScoreBoard CONSTANTS
//------------------------

ScoreBoard.prototype.X = 10;          // Score position
ScoreBoard.prototype.Y = 40;          // y position below title
ScoreBoard.prototype.LIFE_X = 250;    // to centre on screen based on 3 lives
ScoreBoard.prototype.LIFE_Y = -4;     // to take account of blank space at top
ScoreBoard.prototype.BLING_X = 390;   // x position of collected bling
ScoreBoard.prototype.BLING_Y = -10;   // to take account of blank space at top


//------------------------
// ScoreBoard.render()
//------------------------

ScoreBoard.prototype.initial = function () {
  this.x = this.X;
  this.y = this.Y;
  this.lifeX = this.LIFE_X;
  this.lifeY = this.LIFE_Y;
  this.blingX = this.BLING_X;
  this.blingY = this.BLING_Y;
  this.score = 0;
  this.sprite = 'images/Heart.png';
  this.collectible = game.DEFAULT_COLLECTIBLE;
  this.collection = 0;
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
  var spriteWidth = spriteHeart.width * 0.35;
  var spriteHeight = spriteHeart.height * 0.35;
  // render one for each life
  for (var i = 0; i < game.playerLives; i++) {
    ctx.drawImage(spriteHeart, this.lifeX + i * spriteWidth, this.lifeY, spriteWidth, spriteHeight);
  }
  // show bling collected
  var spriteBling = Resources.get(this.collectible);
  for (var i = 0; i < this.collection; i++) {
    ctx.drawImage(spriteBling, this.blingX + i * spriteWidth, this.blingY, spriteWidth, spriteHeight);
  }
};


//************************
// instantiate objects
//************************

var game = new Game();
// var allEnemies = [new Enemy(), new Enemy(), new Enemy()];
var allEnemies = [];
var player = new Player();
var scoreBoard = new ScoreBoard();
var gameInfo = new GameInfo();
var gameOverScreen = new GameOverScreen();
var gameWonScreen = new GameWonScreen();
var gamePausedScreen = new GamePausedScreen();
var gameLevelUpScreen = new GameLevelUpScreen();
// var bling = [new Bling(), new Bling()];
var bling = [];
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
