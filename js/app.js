// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images

    // all bugs enter from left
    this.x = 0;

    // randomise row between 1 and 3. Math.floor(Math.random()*(max-min+1)+min);
    // stone row heights = 83 centre is 42
    // offset y so that bug runs centrally 21 works...

    this.y = Math.floor(Math.random() * 3 + 1) * 83 - 21;

    // bug speed - want randomised 3, slow (1), med(2), fast(3)

    var minSpeed = 100;
    //var maxSpeed = 256;
    //this.speed = Math.floor(Math.random()*(maxSpeed - minSpeed + 1) + minSpeed);
    this.speed = Math.floor(Math.random() * 3 + 1) * minSpeed;

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

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    //this.x = Math.floor(Math.random() * 5 + 0) * 101;
    //this.y = 606 - 171 - 41;
    this.score = 0;
    this.reset();
    this.sprite = 'images/char-boy.png';
};

Player.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
};

Player.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);

    // scoreboard
    ctx.font = '30pt Helvetica';
    ctx.fillStyle = 'orange';
    ctx.strokeStyle = 'red';
    ctx.clearRect(0, 0, 505, 50);
    ctx.fillText('Score: ' + this.score, 10, 40);
};

Player.prototype.handleInput = function(keyPress){
    // want to move player by one tile in relevant direction
    // when player reaches water add 1 point and reset start
      switch (keyPress) {
        case 'left':
          if (this.x - 101 < 0) {
            break;
          } else {
            this.x -= 101;
            break;
          }
        case 'right':
          if (this.x + 101 >= 505) {
            break;
          } else {
            this.x += 101;
            break;
          }
        case 'up':
          if (this.y - 83 < 0) {
            this.reset();
            this.score ++;
            break;
          } else {
            this.y -= 83;
            break;
          }
        case 'down':
          if (this.y + 83 > 394) {
            break;
          } else {
            this.y += 83;
            break;
          }
        default:
        return;
      }
};

Player.prototype.reset = function(dt) {
    // if reach water reset with same player
    // moved setting x and y position here.
    // sprite height = 171
    // col widths = 101
    // randomise col between 0 and 4.
    // Math.floor(Math.random() * (max - min + 1) + min);
    // player StartY is grid height - sprite height - aesthetic offset = 394

    this.x = Math.floor(Math.random() * 5 + 0) * 101;
    this.y = 606 - 171 - 41;

    // if collide reset with new player
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [new Enemy(), new Enemy(), new Enemy()];
var player = new Player();



// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
