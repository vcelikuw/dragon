function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
    Entity.call(this, game, 0, 400);
    this.radius = 20;
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    ctx.fillStyle = "darkorange";
    ctx.fillRect(0, 450, 800, 300);
    ctx.font = "50px chiller";
    ctx.fillText(" Viktoriya Celik ", 540, 50);
    ctx.fillStyle = "darkred";
    ctx.fillRect(0, 500, 800, 500);
    ctx.font = "45px chiller";
    ctx.fillText("'A' = Left", 10, 50);
    ctx.fillText("'D' = Right", 10, 100);
    ctx.fillText("'Space' = Jump ", 10, 150);
    Entity.prototype.draw.call(this);
}

function Dragon(game) {
    
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/dragon.png"), 0, 0, 139, 121, 0.07, 15, true, false);
    this.walkanimation = new Animation(ASSET_MANAGER.getAsset("./img/dragon.png"), 0, 620, 255, 260, 0.15, 11, true, false); 
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/dragon.png"), 0, 300, 227, 264, 0.12, 12, false, true);
   
    this.right = false;
    this.left = false;
    this.kick = false;
    this.jumping = false;
    this.radius = 100;
    this.ground = 400;
    Entity.call(this, game, 100, 360);

}

Dragon.prototype = new Entity();
Dragon.prototype.constructor = Dragon;


Dragon.prototype.update = function () {

    //Bounds
    if (this.x <= 0) {
        this.x = this.x + 6;
    }
    if (this.x >= 800 - 200) {   
        this.x = this.x - 6;
    }

    //Stop Moving
    if (!this.game.D || !this.game.A) this.right = false;

    //Walk Right
        if (this.game.D) {
        this.left = false;
        this.right = true;
        this.x += 3;    
    }
  
    //Walk Left
        if (this.game.A) {
        this.left = true;
        this.right = true;
        this.x -= 3;
    }
  
    //Jump
    if (this.game.space) this.jumping = true;
    if (this.jumping) {
        if (this.jumpAnimation.isDone()) {
            this.jumpAnimation.elapsedTime = 0;
            this.jumping = false;
        }
        var jumpDistance = this.jumpAnimation.elapsedTime / this.jumpAnimation.totalTime;
        var totalHeight = 300;

        if (jumpDistance > 0.5)
            jumpDistance = 1 - jumpDistance;

        //var height = jumpDistance * 2 * totalHeight;
        var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));
        this.y = this.ground - height;
        this.y = this.y - 40;
    }

    Entity.prototype.update.call(this);
}

Dragon.prototype.draw = function (ctx) {
    if (this.left) {
        if (this.jumping) {
            ctx.save();
            ctx.scale(-1, 1);
            this.jumpAnimation.drawFrame(this.game.clockTick, ctx, -this.x - 150, this.y - 80);
            ctx.restore();
        }
        else if (this.right) {
            ctx.save();
            ctx.scale(-1, 1);
            this.walkanimation.drawFrame(this.game.clockTick, ctx, -this.x - 160, this.y - 140);
            ctx.restore();
        }
        else {
            ctx.save();
            ctx.scale(-1, 1);
            this.animation.drawFrame(this.game.clockTick, ctx, -this.x -100, this.y);
            ctx.restore();
        }
    }
    else {
        if (this.jumping) {
            this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x - 40, this.y - 80);
        }
        else if (this.right) {
            this.walkanimation.drawFrame(this.game.clockTick, ctx, this.x, this.y - 140);
        }
        else {
            this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
        }
    }
    Entity.prototype.draw.call(this);

}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();
ASSET_MANAGER.queueDownload("./img/dragon.png");
ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    var dragon = new Dragon(gameEngine);

    gameEngine.addEntity(bg);
    gameEngine.addEntity(dragon);
 
    gameEngine.init(ctx);
    gameEngine.start();
});
