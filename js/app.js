//************************
// Game
//************************

// it's getting a little muddied up so want to declare some constants and
// resuable functions - should make things easier to read later.
// the reworking was a nightmare - but threw up some essential fixes!
// So now, the constants are capitalised and outside the class definitions

var Game = function(){
  this.gameOn = false;
  this.startScreen = true;
  this.gameOver = false;
  this.paused = true;
};

//------------------------
// Game CONSTANTS
//------------------------
Game.TILE_WIDTH = 101;
Game.TILE_HEIGHT = 171;
Game.ROW_HEIGHT = 83;
Game.ROW_CENTER_Y = 21; // offset so that bugs run in centre of row
Game.NUM_ROWS = 6;
Game.NUM_COLS = 5;
Game.MIN_BLING = 3; // number of gems in play
Game.MIN_ENEMIES = 3;  // number of enemies in play
Game.PLAYER_LIVES = 3;

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
  this.playerLives = Game.PLAYER_LIVES;
  this.paused = false;
  player = new Player();
  scoreBoard = new ScoreBoard();
  dropZone = new DropZone();
  allEnemies = [new Enemy(), new Enemy(), new Enemy()];
  bling = [new Bling(), new Bling()];
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
  this.x = - Game.TILE_WIDTH;
  // bugs run in random row
  this.y = game.randomise(1, 3) * Game.ROW_HEIGHT - Game.ROW_CENTER_Y ;

  // tile size if necessary
   this.width = Game.TILE_WIDTH;
   this.height = Game.TILE_HEIGHT;

  // bug speed - want randomised 3, slow (1), med(2), fast(3)
  this.speed = game.randomise(1, 3) * Enemy.MIN_SPEED;

  this.sprite = 'images/enemy-bug.png';
};

//------------------------
// Enemy CONSTANTS
//------------------------

// sprite target dimensions (visible part of tile)
Enemy.HIT_WIDTH = 75;
Enemy.HIT_HEIGHT = 44;  // required for depth of bug
Enemy.HIT_X = 11;       // x offset for visible part of tile

// bug speed - want randomised 3, slow (1), med(2), fast(3)
Enemy.MIN_SPEED = 100; // may increase if implement levels

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
    console.log('enemy.update: COLLISION with player');
    console.log(' - player.hasBling = ' + player.hasBling);
    console.log(' - player.dropsBling = ' + player.dropsBling);
    console.log(' - dropZone.dropReceived = ' + dropZone.dropReceived);
    console.log(' - dropZone.visible = ' + dropZone.visible);
    console.log('------ Actions ------');

    if (player.hasBling) {
      scoreBoard.score -= 10; // lose 10 points
      player.losesBling();      // drop bling
      dropZone.visible = false;
    } else {
      scoreBoard.score --;            // lose a point
    }

    game.playerLives --;            // lose a life
    if (game.playerLives === 0) {   // gameOver
      return game.isGameOver(true);
    }

    player.reset();                 // reset player
    console.log(' - player.hasBling = ' + player.hasBling);
    console.log(' - player.dropsBling = ' + player.dropsBling);
    console.log(' - dropZone.dropReceived = ' + dropZone.dropReceived);
    console.log(' - dropZone.visible = ' + dropZone.visible);
    console.log('*********************');
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
  var i = allEnemies.indexOf(this);       // find this instance of bug
  if (i != -1) {
    allEnemies.splice(i, 1);              // delete it
    if (allEnemies.length < Game.MIN_ENEMIES) {
      allEnemies.push(new Enemy());       // push new bug to array
    }
  }
};

//------------------------
// Enemy.checkCollisions()
//------------------------

//Enemy.prototype.checkCollisions = function(x, y, w, h, x2, y2, w2, h2) {};
Enemy.prototype.checkCollisions = function() {
    if (this.x + Enemy.HIT_X < player.x + Player.HIT_X + Player.HIT_WIDTH &&
        this.x + Enemy.HIT_X + Enemy.HIT_WIDTH > player.x + Player.HIT_X &&
        this.y < player.y + Player.HIT_HEIGHT &&
        Enemy.HIT_HEIGHT + this.y > player.y) {
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
Player.HIT_WIDTH = 70;
Player.HIT_HEIGHT = 80;
Player.HIT_X = 15;     // x offset for visible area

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
      if (this.x - Game.TILE_WIDTH < 0) {
        break;
      } else {
        this.x -= Game.TILE_WIDTH;
      }
      break;
      case 'right':       // to move right in bounds
      if (this.x + Game.TILE_WIDTH >= 505) {
        break;
      } else {
        this.x += Game.TILE_WIDTH;
      }
      break;
      case 'up':          // to move up in bounds, reach water, reset position
      if (this.y - Game.ROW_HEIGHT < 0) {
        // don't jump in water with bling
        if (this.hasBling) {
          scoreBoard.score -= 5; // lose 10 points
          this.losesBling();      // drop bling
          dropZone.visible = false;
        } else {
          scoreBoard.score ++;     // reached water add a point to score
        }

        this.reset();
        // scoreBoard.score ++;  // reached water add a point to score

        break;
      } else {
        this.y -= Game.ROW_HEIGHT;
      }
      break;
      case 'down':       // to move down in bounds
      if (this.y + Game.ROW_HEIGHT > 394) {
        break;
      } else {
        this.y += Game.ROW_HEIGHT;
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
    // randomise start position and centre in tile
  this.x = game.randomise(0, 4) * Game.TILE_WIDTH;
  this.y = (Game.NUM_ROWS - 1) * Game.ROW_HEIGHT - Game.ROW_CENTER_Y;
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
  // initial state of bling // TODO: maybe create an initiate method
  this.visible = false;

  // bling picked up, dropped, delivered, collected
  this.picked = false;
  this.dropped = false;
  this.delivered = false;
  this.collected = false;     // if implement levels

  // delay appearance of bling
  this.delayCount = game.randomise(Bling.DELAY_MIN, Bling.DELAY_MAX);
  // for reset after delivery - fade time shorter than dropzone fade
  this.resetCount = 0;

  // sprite dimensions (might also work as hit dimensions)
  this.width = Game.TILE_WIDTH * Bling.SHRINK;
  this.height = Game.TILE_HEIGHT * Bling.SHRINK;
  // offset to centre bling on tile
  this.offsetX = (Game.TILE_WIDTH - this.width) / 2;

  // sprite dimensions if (this.picked)
  this.pickWidth = Game.TILE_WIDTH * Bling.SHRINKMORE;
  this.pickHeight = Game.TILE_HEIGHT * Bling.SHRINKMORE;
  // offset to position picked up bling
  this.pickX = (Game.TILE_WIDTH - this.pickWidth) / 2;
  this.pickY = (this.height);

  // bling to appear in random places (same rows as bugs)
  this.x = game.randomise(0, 4) * Game.TILE_WIDTH + this.offsetX;
  this.y = game.randomise(1, 3) * Game.ROW_HEIGHT + Game.ROW_CENTER_Y ;

  // select random gem from array
  // want greater number of blues to greens to oranges
  var colour = ['blue', 'blue', 'blue', 'green', 'green', 'orange'];
  this.gem = 'images/gem-' + colour[game.randomise(0, 5)] + '.png';

  // ideas: //
  // bling to time out (kind of does as is linked to dropZone)
  // or turn into impenetrable rock blocking part of grid
};

//------------------------
// Bling constants
// it appears that defining the constants outside the class works better
// for example in Bling.Update
//    this.resetCount = Bling.RESET_TIME;  === 15
// but
//    this.resetCount = this.resetTime;  is undefined.
//------------------------

Bling.RESET_TIME = 15;    // reset after delivery - fade time shorter than dropzone fade
Bling.SHRINK = 0.6;      // Draw the bling - smaller - it is huge!
Bling.SHRINKMORE = 0.3;  // Resize for bling when picked up

Bling.DELAY_MIN = 20;   // delay appearance of bling
Bling.DELAY_MAX = 200;

// HIT_HEIGHT defined for collisions with player
Bling.HIT_HEIGHT = 40;      // moved to bling contants

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
  if (this.visible) {

  if (this.resetCount > 1) {
      this.resetCount --;
  } else

    if (this.resetCount === 1) {
      console.log('bling.update: DELIVERED: true > resetCount = ' + this.resetCount);
      console.log(' - this.picked = ' + this.picked);
      console.log(' - this.delivered = ' + this.delivered);
      console.log(' - this.dropped = ' + this.dropped);
      console.log(' - player.hasBling = ' + player.hasBling);
      console.log(' - player.dropsBling = ' + player.dropsBling);
      console.log(' - dropZone.dropReceived = ' + dropZone.dropReceived);
      console.log('------ Actions ------');
      this.resetCount --;
      this.delivered = false;
      console.log(' - this.delivered = ' + this.delivered);
      console.log('---- bling reset ----');
      this.reset();
      console.log('*********************');
    }

    // check if bling dropped by dZ timeout
    if (this.picked && player.dropsBling) {
      console.log('bling.update: dropZone timeout: DROPPED');
      console.log(' - this.picked = ' + this.picked);
      console.log(' - this.delivered = ' + this.delivered);
      console.log(' - this.dropped = ' + this.dropped);
      console.log(' - player.hasBling = ' + player.hasBling);
      console.log(' - player.dropsBling = ' + player.dropsBling);
      console.log(' - dropZone.dropReceived = ' + dropZone.dropReceived);
      console.log('------ Actions ------');
      this.picked = false;
      player.dropsBling = false;
      console.log(' - this.picked = ' + this.picked);
      console.log(' - player.dropsBling = ' + player.dropsBling);
      console.log('--- dropZone reset ---');
      dropZone.reset();
      console.log('---- bling reset ----');
      this.reset();
      console.log('*********************');
      //console.log('bling.update: bling.picked && player.dropsBling > bling.picked: false, drop reset, bling reset, player.dropsBling: false;');
    }

// console.log('bling.update: visible before switch');

    switch (this.checkCollisions()) {
      // player picks up gem
      case 'pickup':
        this.picked = true;
        player.hasBling = true;
        dropZone.show();
        console.log('bling.update: checkCollisions: PICKUP');
        console.log(' - this.picked = ' + this.picked);
        console.log(' - this.delivered = ' + this.delivered);
        console.log(' - this.dropped = ' + this.dropped);
        console.log(' - player.hasBling = ' + player.hasBling);
        console.log(' - player.dropsBling = ' + player.dropsBling);
        console.log(' - dropZone.dropReceived = ' + dropZone.dropReceived);
        console.log(' - resetCount = ' + this.resetCount);
        console.log('*********************');
        break;
      // gem has been deliverd to dropZone
      case 'delivered':
        this.picked = false;
        this.delivered = true;
        dropZone.dropReceived = true;
        player.hasBling = false;
        scoreBoard.score += 10;
        this.resetCount = Bling.RESET_TIME;
        console.log('bling.update: checkCollisions: DELIVERED');
        console.log(' - this.picked = ' + this.picked);
        console.log(' - this.delivered = ' + this.delivered);
        console.log(' - this.dropped = ' + this.dropped);
        console.log(' - player.hasBling = ' + player.hasBling);
        console.log(' - player.dropsBling = ' + player.dropsBling);
        console.log(' - dropZone.dropReceived = ' + dropZone.dropReceived);
        console.log(' - resetCount = ' + this.resetCount);
        console.log('*********************');
        break;
      // gem has been dropped
      case 'dropped':
        // to be determined but possibly
        this.picked = false;
        this.dropped = true;
        dropZone.reset();
        this.reset();
        console.log('bling.update: checkCollisions: DROPPED');
        console.log(' - this.picked = ' + this.picked);
        console.log(' - this.delivered = ' + this.delivered);
        console.log(' - this.dropped = ' + this.dropped);
        console.log(' - player.hasBling = ' + player.hasBling);
        console.log(' - player.dropsBling = ' + player.dropsBling);
        console.log(' - dropZone.dropReceived = ' + dropZone.dropReceived);
        console.log('*********************');
        break;
      default:
        return;
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
//TODO: rework this code into cases
// Even though bling is static, check for player bumping into it as it is an array item
Bling.prototype.checkCollisions = function() {
  // interactions with player
  // if player already holds a different instance of gem return false
  // player ignore bling
  // all conditions need to be false in order to pick up bling

  if (!this.delivered && !this.dropped && !player.dropsBling) {
    // conditions for delivery in dropZone
    if (this.picked && player.hasBling && dropZone.visible) {
      if (dropZone.x < player.x + Player.HIT_X + Player.HIT_WIDTH &&
          dropZone.x + dropZone.width > player.x + Player.HIT_X &&
          dropZone.y < player.y + Player.HIT_HEIGHT &&
          dropZone.height + dropZone.y > player.y) {
        // collision detected!
        console.log('bling.checkCollisions: DELIVERED');
        console.log('*********************');
        return 'delivered';
      }
    } // end of delivery conditions

    // conditions for pickup
    if (!this.picked && !player.hasBling && !dropZone.dropReceived && !dropZone.visible) {
      if (this.x < player.x + Player.HIT_X + Player.HIT_WIDTH &&
          this.x + this.width > player.x + Player.HIT_X &&
          this.y < player.y + Player.HIT_HEIGHT &&
          Bling.HIT_HEIGHT + this.y > player.y) {
        // collision detected!
        console.log('bling.checkCollisions: PICKUP');
        console.log('*********************');
        return 'pickup';
      } else {
//        console.log('bling.checkCollisions: IGNORE > wrong conditions for pickup');
        return 'ignore';
      }
    } // end pickup conditions
  } // these must be false
//  console.log('bling.checkCollisions: IGNORE > dropped or delivered');
  return 'ignore';
}; // end checkCollisions

//------------------------
// Bling.reset()
//------------------------

Bling.prototype.reset = function () {
  // find index of this instance and delete it
  var i = bling.indexOf(this);
  if (i != -1) {
    bling.splice(i, 1);

  // keep the bling array topped up with new bling
    while (bling.length < Game.MIN_BLING) {
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
  this.displayCount = 0;  // counter for fixed time display
  this.resetCount = 0;    // counter for fade out after delivery / timeout
  this.dropReceived = false; // true when bling delivered here
  this.reset();

  // bling to appear in random places (grass rows)
  this.x = game.randomise(0, 4) * Game.TILE_WIDTH;
  this.y = game.randomise(4, 5) * Game.ROW_HEIGHT + Game.ROW_CENTER_Y ;

  this.width = Game.TILE_WIDTH;
  this.height = Game.ROW_HEIGHT;
  this.sprite = 'images/Selector.png';
};

//------------------------
// DropZone CONSTANTS
//------------------------

DropZone.DISPLAY_TIME = 200; // for visibility timer
DropZone.RESET_TIME = 20; // for reset fade time

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
  if (this.visible && !this.dropReceived && this.displayCount > 1) {
    this.displayCount --;

    // if player doesn't reach dropZone in time
  } else if (this.visible && !this.dropReceived && this.displayCount === 1) {
    console.log('dropZone.update: TIMEOUT > player drops bling and dropZone reset');
    console.log(' - player.hasBling = ' + player.hasBling);
    console.log(' - player.dropsBling = ' + player.dropsBling);
    console.log(' - dropZone.dropReceived = ' + dropZone.dropReceived);
    console.log('------ Actions ------');
    player.dropsBling = true;
    player.hasBling = false;  // was true
    this.displayCount --;
    console.log(' - player.hasBling = ' + player.hasBling);
    console.log(' - player.dropsBling = ' + player.dropsBling);
    console.log(' - dropZone.dropReceived = ' + dropZone.dropReceived);
    console.log('--- dropZone reset ---');
    dropZone = new DropZone();
    console.log('--- DO NOT PICKUP ---');
    console.log('*********************');

    // fade out time from delivery to reset dropZone
  } else if (this.visible && this.resetCount > 1) {
    this.resetCount --;

    // still visible til reset dropZone at last moment
  } else if (this.visible && this.resetCount === 1) {
    this.resetCount --;
    dropZone = new DropZone();
    console.log('dropZone.update: RESET count === 1 > dropZone reset');
    console.log(' - player.hasBling = ' + player.hasBling);
    console.log(' - player.dropsBling = ' + player.dropsBling);
    console.log(' - dropZone.dropReceived = ' + dropZone.dropReceived);
    console.log('*********************');
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
  this.resetCount = DropZone.RESET_TIME;
  this.displayCount = DropZone.DISPLAY_TIME;
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
  this.x = GameScreen.X;
  this.y = GameScreen.Y;
  this.width = Game.TILE_WIDTH * Game.NUM_COLS;
  this.height = GameScreen.HEIGHT;
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
  this.y = GameScreen.Y;
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
