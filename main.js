const config = {
  type: Phaser.AUTO,
  width: 650,
  height: 384,
  backgroundColor: '#5C94FC',
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 200 }
      }
  },
  scene: {
      preload: preload,
      create: create,
      update: update
    }
};

let game = new Phaser.Game(config);

function preload() {
  this.load.tilemapTiledJSON('levelData', 'assets/map1-1.json');
  this.load.image('tiles', 'assets/items.png');
  this.load.image('star', 'assets/star.png');
  this.load.spritesheet('marian', 'assets/marioS.png', { frameWidth: 34, frameHeight: 34 });
}

let marian = {
  sprite: undefined,
  direction: 'right',
  doNothing: true,
  coins: 0,
  hearts: 3,
  unkillable: 0
}

let cursors;
let main_layer;
let infoLabel;
let coin_layer;
let star_layer;
let stars;

function create() {
	const map = this.make.tilemap({ key: 'levelData' })
	const tileset = map.addTilesetImage('items', 'tiles')
  main_layer = map.createLayer('Level 1', tileset, 0, 0);
  main_layer.wrap = true;
  main_layer.setScale(1.5, 1.5);
  coin_layer = map.createLayer('Coin l1', tileset, 0, 0);
  coin_layer.wrap = true;
  coin_layer.setScale(1.5, 1.5);
  star_layer = map.createLayer('Evil Star l1', tileset, 0, 0);
  star_layer.wrap = true;
  star_layer.setScale(1.5, 1.5);

  stars = this.physics.add.group();
  star_layer.forEachTile(tile => {
    if (tile.index == 19 ) 
    {
      const x = tile.getCenterX() - (tile.width * 0.5);
      const y = tile.getCenterY();

      let star = stars.create(x, y, 'star').setScale(1.5, 1.5);
      star.body.velocity.x = 100;
      star.body.allowGravity = false;
      star.setBounce(1);

      star_layer.removeTileAt(tile.x, tile.y);
    }
  });

  marian.sprite = this.physics.add.sprite(50, 50, 'marian');
  marian.sprite.setScale(0.8, 0.8);
  marian.sprite.x = 10;
  marian.sprite.y = 10;

  main_layer.setCollisionBetween(14, 16);
  main_layer.setCollisionBetween(21, 22);
  main_layer.setCollisionBetween(27, 28);
  main_layer.setCollision(10);
  main_layer.setCollision(13);
  main_layer.setCollision(17);
  main_layer.setCollision(40);
  coin_layer.setCollision(11);
  star_layer.setCollision(19);

  marian.sprite.setGravityY(200);
  marian.sprite.body.bounce.y = 0;
  marian.sprite.body.linearDamping = 1;

  walk = this.anims.create({
    key: 'walk',
    frames: this.anims.generateFrameNumbers('marian', { frames: [ 2, 4, 5 ] }),
    frameRate: 4,
    repeat: -1
  });
  wait = this.anims.create({
    key: 'wait',
    frames: this.anims.generateFrameNumbers('marian', { frames: [ 0 ] }),
    frameRate: 4,
    repeat: -1
  });
  jump = this.anims.create({
    key: 'jump',
    frames: this.anims.generateFrameNumbers('marian', { frames: [ 6 ] }),
    frameRate: 4,
    repeat: -1
  });

  marian.sprite.anims.play('walk');

  marian.sprite.body.fixedRotation = true;

  infoLabel = this.add.text(marian.sprite.x, 0, `Hearts: ${marian.hearts}\nCoins: ${marian.coins}`, {
    fontSize: 24
  }).setOrigin(-0.5, -0.5);

  this.cameras.main.setBounds(0, 0, map.widthInPixels * 2, map.heightInPixels);
  this.cameras.main.startFollow(marian.sprite);
  cursors = this.input.keyboard.createCursorKeys();

  this.physics.add.collider(marian.sprite, main_layer);
  this.physics.add.collider(marian.sprite, coin_layer, getCoin);
  this.physics.add.collider(marian.sprite, stars, dieMarian);
  this.physics.add.collider(main_layer, stars);
};

function update(){
  if (marian.sprite.body.y > 400)
  {
    marian.hearts = 0;
  }

  if (marian.sprite.body.x > 4740)
  {
    this.scene.restart();
  }

  if (marian.hearts <= 0)
  {
    marian.hearts = 3;
    marian.coins = 0;
    this.scene.restart();
  }

  marian.doNothing = true;
  if (cursors.left.isDown)
  {
    if(marian.direction != 'left')
    {
      marian.sprite.flipX = true;
      marian.direction = 'left';
    }

    marian.sprite.body.velocity.x -= 5;
    if(marian.sprite.body.velocity.x < -120)
    {
      marian.sprite.body.velocity.x = -120;
    }
    marian.doNothing = false;
  }
  else if (cursors.right.isDown)
  {
    if(marian.direction != 'right')
    {
      marian.sprite.flipX = false;
      marian.direction = 'right';
    }
    
    marian.sprite.body.velocity.x += 5;
    if(marian.sprite.body.velocity.x > 120)
    {
      marian.sprite.body.velocity.x = 120;
    }
    marian.doNothing = false;
  }
  if(marian.sprite.body.onFloor() && marian.sprite.body.velocity.x != 0)
  {
    marian.sprite.play('walk', 10, true);
  }

  if (cursors.up.isDown && marian.sprite.body.onFloor())
  {
    marian.sprite.body.velocity.y = -310;
    marian.sprite.play('jump', 20, true);
    marian.doNothing = false;
  }

  if(marian.doNothing)
  {
    if(marian.sprite.body.velocity.x > 10)
    {
      marian.sprite.body.velocity.x -= 10;
    }
    else if(marian.sprite.body.velocity.x < -10)
    {
      marian.sprite.body.velocity.x += 10;
    }
    else
    {
      marian.sprite.body.velocity.x = 0;
    }

    if(marian.sprite.body.onFloor())
    {
      marian.sprite.play('wait', 20, true);
    }
  }
  infoLabel.x = this.cameras.main.worldView.x;
  infoLabel.text = `Hearts: ${marian.hearts}\nCoins: ${marian.coins}`;

  if (marian.unkillable > 0)
  {
    marian.unkillable -= 1;
  }
}

function getCoin(marian_sheet, coin)
{
  coin.visible = false;
  coin.x = 0;
  coin.y = 0;
  coin.destroy();

  marian.coins += 1;
}

function dieMarian(marian_sheet, star)
{
  if (marian.unkillable == 0)
  {
    marian.hearts -= 1;
  }
  marian.sprite.body.velocity.y = -310;
  marian.unkillable = 60;
}
