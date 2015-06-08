/**
 * Created by joelsaxton on 11/8/14.
 */
StarPatrol.Game = function(){

    // Scaled physics and values based on this.GAME_SCALE
    this.GAME_SCALE = 0.10;
    this.GAMESIZE = this.GAME_SCALE * 400000;
    this.GRAVITY = this.GAME_SCALE * 1000;
    this.GRAVITYRANGE = this.GAME_SCALE * 5000;
    this.MISSILESCALE = this.GAME_SCALE * 0.4;
    this.LASERSCALE = this.GAME_SCALE * 0.3;
    this.NUKESCALE = this.GAME_SCALE * 0.5;
    this.EXPLOSIONSCALE = this.GAME_SCALE * 6;
    this.PLANETSCALE = this.GAME_SCALE * 10;
    this.MAP_PLANETSCALE = this.GAME_SCALE * 60;

    // Timers
    this.rechargeTimer = 0;
    this.reloadTimer = 0;
    this.warpTimer = 0;
    this.alienInterval = 24000;
    this.alienTimer = 0;

    // Scalars
    this.KILL_ALIEN_SCORE = 500;
    this.mapSize = 200;
    this.mapOffset = 4;
    this.mapGameRatio = this.mapSize / this.GAMESIZE;
    this.asteroidDensity = 4;
    this.TOTALASTEROIDS = parseInt(this.GAMESIZE/2000) * this.asteroidDensity;
    this.TOTALALIENS = 1; // How many appear at any one time
    this.orbitSpeedModifier = 0.8;
    this.gameOver = false;
};

StarPatrol.Game.prototype = {
    create: function() {
        // Enable physics
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

        // Add debug plugin
        //this.game.add.plugin(Phaser.Plugin.Debug);

        // Set world size
        this.game.world.setBounds(0, 0, this.GAMESIZE, this.GAMESIZE);

        //  Our tiled scrolling background
        this.background = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
        this.background.fixedToCamera = true;

        // Add map sprite
        this.map = this.add.sprite(this.game.width - (this.mapSize) - this.mapOffset, this.mapOffset, 'map');
        this.map.scale.setTo(1); // To match this.mapSize ratio (200px = scale of 1)


        // Build solar system with planet and Planet map sprites
        this.sun = this.add.sprite(this.world.centerX, this.world.centerY, 'sun');
        this.sun.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset * 2 + parseInt(this.sun.x * this.mapGameRatio), parseInt(this.sun.y * this.mapGameRatio) + this.mapOffset, 'sun');
        this.mercury = this.add.sprite(this.world.centerX, this.world.centerY, 'mercury');
        this.mercury.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset + parseInt(this.mercury.x * this.mapGameRatio), parseInt(this.mercury.y * this.mapGameRatio) + this.mapOffset, 'mercury');
        this.venus = this.add.sprite(this.world.centerX, this.world.centerY, 'venus');
        this.venus.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset + parseInt(this.venus.x * this.mapGameRatio), parseInt(this.venus.y * this.mapGameRatio) + this.mapOffset, 'venus');
        this.earth = this.add.sprite(this.world.centerX, this.world.centerY, 'earth');
        this.earth.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset + parseInt(this.earth.x * this.mapGameRatio), parseInt(this.earth.y * this.mapGameRatio) + this.mapOffset, 'earth');
        this.mars = this.add.sprite(this.world.centerX, this.world.centerY, 'mars');
        this.mars.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset + parseInt(this.mars.x * this.mapGameRatio), parseInt(this.mars.y * this.mapGameRatio) + this.mapOffset, 'mars');
        this.jupiter = this.add.sprite(this.world.centerX, this.world.centerY, 'jupiter');
        this.jupiter.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset + parseInt(this.jupiter.x * this.mapGameRatio), parseInt(this.jupiter.y * this.mapGameRatio) + this.mapOffset, 'jupiter');
        this.saturn = this.add.sprite(this.world.centerX, this.world.centerY, 'saturn');
        this.saturn.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset + parseInt(this.saturn.x * this.mapGameRatio), parseInt(this.saturn.y * this.mapGameRatio) + this.mapOffset, 'saturn');
        this.uranus = this.add.sprite(this.world.centerX, this.world.centerY, 'uranus');
        this.uranus.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset + parseInt(this.uranus.x * this.mapGameRatio), parseInt(this.uranus.y * this.mapGameRatio) + this.mapOffset, 'uranus');
        this.neptune = this.add.sprite(this.world.centerX, this.world.centerY, 'neptune');
        this.neptune.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset + parseInt(this.neptune.x * this.mapGameRatio), parseInt(this.neptune.y * this.mapGameRatio) + this.mapOffset, 'neptune');
        this.pluto = this.add.sprite(this.world.centerX, this.world.centerY, 'pluto');
        this.pluto.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset + parseInt(this.pluto.x * this.mapGameRatio), parseInt(this.pluto.y * this.mapGameRatio) + this.mapOffset, 'pluto');

        // Set up orbits
        this.au = this.world.width / 80;
        this.mercury.orbit = this.au * 3.2;
        this.venus.orbit = this.au * 5.7;
        this.earth.orbit = this.au * 8.5;
        this.mars.orbit = this.au * 11.8;
        this.jupiter.orbit = this.au * 15.4;
        this.saturn.orbit = this.au * 20;
        this.uranus.orbit = this.au * 25.8;
        this.neptune.orbit = this.au * 32.8;
        this.pluto.orbit = this.au * 38.5;

        //Set up radii for gravity calculations
        this.earth.radius = this.PLANETSCALE * 125 * 0.5;
        this.mercury.radius = this.PLANETSCALE * 100 * 0.5;
        this.venus.radius = this.PLANETSCALE * 125 * 0.5;
        this.mars.radius = this.PLANETSCALE * 100 * 0.5;
        this.jupiter.radius = this.PLANETSCALE * 175 * 0.5;
        this.saturn.radius = this.PLANETSCALE * 175 * 0.5;
        this.uranus.radius = this.PLANETSCALE * 150 * 0.5;
        this.neptune.radius = this.PLANETSCALE * 150 * 0.5;
        this.pluto.radius = this.PLANETSCALE * 100 * 0.5;

        // Fix map to camera
        this.map.fixedToCamera = true;

        // Planets
        this.planets = this.game.add.group();

        // Add planets to group
        this.planets.add(this.earth);
        this.planets.add(this.pluto);
        this.planets.add(this.neptune);
        this.planets.add(this.uranus);
        this.planets.add(this.saturn);
        this.planets.add(this.jupiter);
        this.planets.add(this.mars);
        this.planets.add(this.venus);
        this.planets.add(this.mercury);
        this.saturn.angle = 45;
        this.saturn.map.angle = 45;

        // Set properties
        this.planets.forEach(function (planet) {
            planet.period = 0;
            planet.periodOffset = this.game.rnd.realInRange(-10,10);
            planet.anchor.setTo(0.5, 0.5);
            planet.scale.setTo(this.PLANETSCALE);
            this.game.physics.arcade.enableBody(planet);
            planet.body.immovable = true;
            planet.map.fixedToCamera = true;
            planet.map.anchor.setTo(0.5, 0.5);
            planet.map.scale.setTo(this.mapGameRatio*this.MAP_PLANETSCALE);
        }, this);

        // Sun
        this.sun.anchor.setTo(0.5, 0.5);
        this.sun.scale.setTo(this.PLANETSCALE * 0.8);
        this.game.physics.arcade.enableBody(this.sun);
        this.sun.body.immovable = true;
        this.sun.map.anchor.setTo(0.5);
        this.sun.map.scale.setTo(this.mapGameRatio*this.MAP_PLANETSCALE * 0.5);
        this.sun.map.x += this.sun.map.width * 0.5;
        this.sun.map.fixedToCamera = true;
        this.sun.radius = this.PLANETSCALE * 400 * 0.5;
        this.planets.add(this.sun);

        // Player parameters
        //this.player = new Player(this, this.earth.x, this.earth.y); // @todo - revisit Player function
        this.player = this.game.add.sprite(this.earth.x, this.earth.y, 'player');
        this.playerScale = this.GAME_SCALE;
        this.player.anchor.setTo(0.5);
        this.player.scale.setTo(this.playerScale * 1.5);

        // Ultimate max values for improvable ship params
        this.player.MAXHEALTH = 1000;
        this.player.MAXCHARGE = 1000;
        this.player.MAXVELOCITY = this.playerScale * 10000;
        this.player.MAXTHRUST = this.playerScale * 200;

        // Mutable limits based on game progress
        this.player.VELOCITY = this.playerScale * 2000;
        this.player.THRUST = this.playerScale * 20;
        this.player.HEALTH = 100;
        this.player.CHARGE = 100;

        this.player.health = this.player.HEALTH;
        this.player.charge = this.player.CHARGE;
        this.player.thrust = this.player.THRUST;
        this.player.MAXTURNINCREMENT = 0.1;
        this.player.MAXTURNRATE = 4;
        this.player.MINTURNRATE = 0.8;
        this.player.WARP_DISCHARGE = 0.2;
        this.player.SHIELD_DISCHARGE = 4;
        this.player.MINSAFEWARPDISTANCE = this.playerScale * 3200;
        this.player.WARPVELOCITY = this.player.VELOCITY * 10;
        this.player.RELOAD_INTERVAL = 500;
        this.player.RECHARGE_INTERVAL = 50;
        this.player.WARP_INTERVAL = 2500;
        this.player.LASER_DISCHARGE = 34;
        this.player.turnRate = 0;
        this.player.maxTurnRate = this.player.MAXTURNRATE;
        this.player.turnIncrement = this.player.MAXTURNINCREMENT;
        this.player.shieldStrength = this.player.CHARGE;
        this.player.warpDrive = this.player.CHARGE;
        this.player.warpModifier = 5;
        this.player.isAlive = true;
        this.player.isReloaded = true;
        this.player.isBurning = false;
        this.player.isWarping = false;
        this.player.isShielded = false;
        this.game.physics.arcade.enableBody(this.player);
        this.player.body.bounce.set(0.8);
        this.player.checkWorldBounds = true;
        this.player.body.collideWorldBounds = true;
        this.player.begin = true;
        this.player.nukes = 3;
        this.player.missiles = 20;
        this.player.hasShields = false;
        this.player.hasWarpDrive = true;
        this.player.selectedWeapon = 'laser';
        this.player.aliensKilled = 0;
        this.player.cash = 0;

        // Set player map
        this.player.map = this.game.add.sprite(this.width - this.mapSize - this.mapOffset + parseInt(this.x * this.mapGameRatio), parseInt(this.y * this.mapGameRatio) + this.mapOffset, 'playermap');
        this.player.map.fixedToCamera = true;
        this.player.map.anchor.setTo(0.5);
        this.player.map.scale.setTo(2);

        // Set player animations
        this.player.animations.add('drift', [0]);
        this.player.animations.add('shield', [1]);
        this.player.animations.play('drift', 20, true);
        this.player.map.animations.add('tracking', [0,1]);
        this.player.map.animations.play('tracking', 10, true);

        // Set Camera
        this.game.camera.follow(this.player);
        this.game.camera.deadzone = new Phaser.Rectangle(this.game.width/2, this.game.height/2, this.game.width/8, this.game.height/8);
        this.game.camera.focusOnXY(0, 0);

        // Set alien
        this.aliens = this.game.add.group();
        this.alien = this.createAlien();
        this.aliens.add(this.alien);
        this.alien.map = this.add.sprite(this.game.width - this.mapSize - this.mapOffset + parseInt(this.alien.x * this.mapGameRatio), parseInt(this.alien.y * this.mapGameRatio) + this.mapOffset, 'alienmap');
        this.alien.map.fixedToCamera = true;
        this.alien.map.anchor.setTo(0.5);
        this.alien.map.scale.setTo(2);
        this.alien.map.animations.add('tracking', [0,1]);
        this.alien.map.animations.play('tracking', 10, true);

        // Set alien animations
        this.alien.animations.add('cruise', [0]);
        this.alien.animations.add('attract', [1,2,3,2,3,2]);

        this.missiles = this.game.add.group();
        this.missiles.setAll('anchor.x', 0.5);
        this.missiles.setAll('anchor.y', 0.5);

        this.lasers = this.game.add.group();

        this.asteroids = this.game.add.group();
        this.asteroids.setAll('anchor.x', 0.5);
        this.asteroids.setAll('anchor.y', 0.5);
        this.asteroids.setAll('checkWorldBounds', true);

        // Create asteroid pool
        while (this.asteroids.countLiving() < this.TOTALASTEROIDS) {
            this.createAsteroid();
        }

        //  Create small explosion pool
        this.explosions = game.add.group();
        for (var i = 0; i < 20; i++)
        {
            var explosionAnimation = this.explosions.create(0, 0, 'explosion', [0], false);
            explosionAnimation.anchor.setTo(0.5, 0.5);
            explosionAnimation.scale.setTo(this.EXPLOSIONSCALE);
            explosionAnimation.animations.add('explosion');
        }

        //  Create big Explosion pool
        this.bigExplosions = game.add.group();
        for (var i = 0; i < 10; i++)
        {
            var explosionAnimation = this.bigExplosions.create(0, 0, 'big-explosion', [0], false);
            explosionAnimation.anchor.setTo(0.5, 0.5);
            explosionAnimation.scale.setTo(this.EXPLOSIONSCALE);
            explosionAnimation.animations.add('big-explosion');
        }

        // Set text bitmaps
        this.scoreText = this.game.add.bitmapText(10,15, 'minecraftia', 'Cash: $' + this.player.cash, 10);
        this.aliensKilledText = this.game.add.bitmapText(10,27, 'minecraftia', 'Aliens Killed: ' + this.player.aliensKilled, 10);
        this.healthText = this.game.add.bitmapText(10,45, 'minecraftia', 'Armor: ' + this.player.health, 8);
        this.batteryText = this.game.add.bitmapText(10,55, 'minecraftia', 'Charge: ' + this.player.charge, 8);
        this.warpText = this.game.add.bitmapText(10,65, 'minecraftia', 'Warp Drive: ' + (this.player.hasWarpDrive ? this.player.warpDrive : 'none'), 8);
        this.shieldText = this.game.add.bitmapText(10,75, 'minecraftia', 'Shields: ' + (this.player.hasShields ? this.player.shieldStrength : 'none'), 8);
        this.laserText = this.game.add.bitmapText(10,95, 'minecraftia', 'Lasers: ' + (this.player.charge >= this.player.LASER_DISCHARGE ? 'ready' : 'charging'), 8);
        this.nukeText = this.game.add.bitmapText(10,105, 'minecraftia', 'Nukes: ' + this.player.nukes, 8);
        this.missileText = this.game.add.bitmapText(10,115, 'minecraftia', 'Missiles: ' + this.player.missiles, 8);
        this.laserText.tint = 0x66CD00; // '#66CD00'
        this.scoreText.fixedToCamera = true;
        this.batteryText.fixedToCamera = true;
        this.shieldText.fixedToCamera = true;
        this.nukeText.fixedToCamera = true;
        this.missileText.fixedToCamera = true;
        this.laserText.fixedToCamera = true;
        this.healthText.fixedToCamera = true;
        this.warpText.fixedToCamera = true;
        this.aliensKilledText.fixedToCamera = true;

        // Set sounds
        this.missileSound = this.game.add.audio('missile');
        this.laserSound = this.game.add.audio('laser');
        this.nukeSound = this.game.add.audio('nuke');
        this.explosionSound = this.game.add.audio('explosion');
        this.bigExplosionSound = this.game.add.audio('big-explosion');
        this.gameMusic = this.game.add.audio('gameMusic');
        this.youBlewIt = this.game.add.audio('youblewit');
        this.warpStartSound = this.game.add.audio('warp-start');
        this.warpSound = this.game.add.audio('warp');
        this.warpLoopSound = this.game.add.audio('warp-on');
        this.warpDownSound = this.game.add.audio('warp-down');
        this.shieldSound = this.game.add.audio('shield-up');
        this.boingSound = this.game.add.audio('boing');
        this.applauseSound = this.game.add.audio('applause');
        this.bendingSound = this.game.add.audio('bending');
        this.gameMusic.play('', 0, 0.6, true, true);

        // Set inputs
        this.cursors = game.input.keyboard.createCursorKeys();
        this.spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.shiftkey = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
        this.nKey = game.input.keyboard.addKey(Phaser.Keyboard.N);
        this.spacebar.onDown.add(this.fireWeapon,this);
        this.nKey.onDown.add(this.nextWeapon,this);
    },

    update: function() {
        if (!this.gameOver) {
            if (this.player.isAlive){
                this.updateAllText();
                this.updateCamera();
                this.checkPlayerInputs();
                this.applyGravity();
                this.updateTimers();
                this.checkCollisions();
                this.updateAsteroids();
                this.updateHealth();
                this.updatePlanetPositions();
                this.updateMapPositions();
                this.alien.bringToTop();
                this.player.bringToTop();
            }

            if (this.alien.alive){
                this.updateAlien();
            }

            this.updateProjectiles();
            this.updateEpisode();
            this.checkWin();
        }
    },

    updatePlanetPositions: function() {
        // Update Planets and their orbits
        this.map.bringToTop();
        this.sun.map.bringToTop();

        this.planets.forEach(function (planet) {
            if (planet.key != 'sun') {
                planet.period += this.orbitSpeedModifier / planet.orbit;
                planet.x = this.world.centerX + planet.width * 0.5 + Math.cos(planet.period + planet.periodOffset) * planet.orbit;
                planet.y = this.world.centerY + planet.height * 0.5 + Math.sin(planet.period + planet.periodOffset) * planet.orbit;
                planet.map.fixedToCamera = false;
                planet.map.x = this.game.width - this.mapSize + parseInt(planet.x * this.mapGameRatio) - this.mapOffset;
                planet.map.y = parseInt(planet.y * this.mapGameRatio) + this.mapOffset;
                planet.map.fixedToCamera = true;
                planet.map.bringToTop();
            }
        }, this);

        // Set player start location near Earth
        if (this.player.begin) {
            this.player.x = this.earth.x + 240;
            this.player.y = this.earth.y - 240;
            this.player.body.velocity.x = 240;
            this.player.body.velocity.y = 240;
            this.player.begin = false;
        }
    },

    checkWin: function() {

        if (this.player.cash >= 10000) { // @todo fix win conditions
            this.gameMusic.stop();
            this.warpLoopSound.stop();
            this.game.world.bounds = new Phaser.Rectangle(0, 0, this.game.width, this.game.height);
            this.game.camera.setBoundsToWorld();
            var scoreboard = new Scoreboard(this.game);
            scoreboard.show(this.player.cash, this.applauseSound, this.explosionSound, true);
            this.killAlien();
            this.gameOver = true;
        }
    },

    updateAllText: function() {
        this.healthText.text = 'Armor: ' + parseInt(this.player.health);
        this.shieldText.text = 'Shields: ' + (this.player.hasShields ? this.player.shieldStrength : 'none');
        this.nukeText.text = 'Nukes: ' + this.player.nukes;
        this.missileText.text = 'Missiles: ' + this.player.missiles;
        this.batteryText.text = 'Charge: ' + this.player.charge;
        this.scoreText.text = 'Cash: $' + this.player.cash;
        this.warpText.text = 'Warp Drive: ' + (this.player.hasWarpDrive ? parseInt(this.player.warpDrive) : 'none');
        this.aliensKilledText.text = 'Aliens Killed: ' + this.player.aliensKilled;
        this.laserText.text = 'Lasers: ' + (this.player.charge >= this.player.LASER_DISCHARGE ? 'ready' : 'charging');
    },


    updateHealth: function() {

        if (this.player.health <= 0) {
            this.killPlayer(true);
            this.gameOver = true;
        }

        // Subtract health if shield was brought below zero
        if (this.player.shieldStrength < 0){
            this.player.health += this.player.shieldStrength;
            this.player.shieldStrength = 0;
        }

        // Update alien health
        if (this.alien.health <= 0 && this.alien.alive){
            this.killAlien();
        }
    },

    updateCamera: function() {
        this.background.tilePosition.x = -game.camera.x;
        this.background.tilePosition.y = -game.camera.y;
    },

    updateMapPositions: function(){
        this.player.map.fixedToCamera = false;
        this.player.map.x = this.game.width - this.mapSize + parseInt(this.player.x * this.mapGameRatio) - this.mapOffset;
        this.player.map.y = parseInt(this.player.y * this.mapGameRatio) + this.mapOffset;
        this.player.map.fixedToCamera = true;
        this.player.map.bringToTop();

        this.alien.map.fixedToCamera = false;
        this.alien.map.x = this.game.width - this.mapSize + parseInt(this.alien.x * this.mapGameRatio) - this.mapOffset;
        this.alien.map.y = parseInt(this.alien.y * this.mapGameRatio) + this.mapOffset;
        this.alien.map.fixedToCamera = true;
        this.alien.map.bringToTop();
    },

    nextWeapon: function() {
        switch (this.player.selectedWeapon) {
            case 'laser':
                this.player.selectedWeapon = 'nuke';
                this.laserText.tint = 0xFFFFFF;
                this.nukeText.tint = 0x66CD00;
                break;
            case 'nuke':
                this.player.selectedWeapon = 'missile';
                this.nukeText.tint = 0xFFFFFF;
                this.missileText.tint = 0x66CD00;
                break;
            case 'missile':
                this.player.selectedWeapon = 'laser';
                this.missileText.tint = 0xFFFFFF;
                this.laserText.tint = 0x66CD00;
                break;
        }
    },

    fireWeapon: function() {
        switch (this.player.selectedWeapon) {
            case 'laser':
                this.fireLaser();
                break;
            case 'nuke':
                this.fireNuke();
                break;
            case 'missile':
                this.fireMissile();
                break;
        }
    },

    fireMissile: function () {
        if (this.player.isReloaded && this.player.missiles > 0) {
            this.player.missiles--;
            this.missileSound.play('', 0, 0.4, false, true);
            this.createMissile(this.player.x, this.player.y, this.player.angle);
            this.player.isReloaded = false;
        }
    },

    fireLaser: function () {
        if (this.player.isReloaded && this.player.charge >= this.player.LASER_DISCHARGE) {
            this.player.charge -= this.player.LASER_DISCHARGE;
            this.laserSound.play('', 0, 0.4, false, true);
            this.createLaser(this.player.x, this.player.y, this.player.angle);
            this.player.isReloaded = false;
        }
    },

    fireNuke: function () {
        if (this.player.isReloaded && this.player.nukes > 0) {
            this.player.nukes--;
            this.nukeSound.play('', 0, 0.6, false, true);
            this.createNuke(this.player.x, this.player.y, this.player.angle);
            this.player.isReloaded = false;
        }

        // if player fires nuke while warping, kill him
        if (this.player.isWarping) {
            this.killPlayer(true);
        }
    },

    checkPlayerInputs: function () {
        // Constrain velocity
        if (this.player.isWarping) {
           this.constrainVelocity(this.player, this.player.WARPVELOCITY);
        } else {
            this.constrainVelocity(this.player, this.player.VELOCITY);
        }

        // Decide animation
        if (!this.cursors.up.isDown) {
            if (!this.player.isBurning && !this.player.isShielded) {
                this.player.animations.play('drift', 20, true);
            }
        }

        // Check if player is warping too close to tractor beam being used on him
        if (this.player.isWarping && this.alien.isTractorBeamOn && this.alien.target == this.player && this.game.physics.arcade.distanceBetween(this.alien, this.player) < this.player.MINSAFEWARPDISTANCE) {
            this.player.health -= 0.2;
            this.warpSound.stop();
            this.warpLoopSound.stop();
            this.warpStartSound.stop();
            this.bendingSound.play('', 0, 1, false, false);
            return;
        }
        // use shields
        if (this.shiftkey.isDown && this.player.hasShields && !this.player.isWarping && this.player.charge > 0 && this.player.shieldStrength > 0) {
            this.player.charge -= this.player.SHIELD_DISCHARGE;
            this.player.animations.play('shield', 50, true);
            // play shield-on sound
            if (!this.player.isShielded) {
                this.shieldSound.play('', 0, 0.05, false);
            }
            this.player.isShielded = true;

        } else if (this.player.isShielded) {
            this.player.isShielded = false;
            this.player.animations.play('drift', 20, true);
        }
        // Use warp drive
        if (this.cursors.down.isDown && this.player.hasWarpDrive && this.player.warpDrive > 0) {
            // play warp-on sound
            if (!this.player.isWarping) {
                this.warpSound.play('', 0, 0.5, false);
                this.warpStartSound.play('', 0, 0.8, false);
            }
            // play warp loop sound
            if (!this.warpLoopSound.isPlaying) {
                this.warpLoopSound.play('', 0, 0.05, true);
            }
            this.player.turnRate = 0;
            this.player.isWarping = true;
            this.player.warpDrive -= this.player.WARP_DISCHARGE;
            var x_component = Math.cos((this.player.angle) * Math.PI / 180);
            var y_component = Math.sin((this.player.angle) * Math.PI / 180);
            this.player.body.velocity.x += this.player.thrust * this.player.warpModifier * x_component;
            this.player.body.velocity.y += this.player.thrust * this.player.warpModifier * y_component;
        } else if (this.player.isWarping) {
            this.player.isWarping = false;
            this.warpDownSound.play('', 0, 0.8, false);
            this.warpLoopSound.stop();
        }

        // Change direction and thrust only if not warping
        if (!this.player.isWarping) {
            // Turn rate
            if (!this.cursors.right.isDown && !this.cursors.left.isDown && Math.abs(this.player.turnRate) <= this.player.MINTURNRATE) {
                this.player.turnRate = 0;
            }
            // Thrust
            if (this.cursors.up.isDown) {
                if (!this.player.isBurning && !this.player.isShielded) {
                    //this.player.animations.play('thrust');
                }
                var x_component = Math.cos((this.player.angle) * Math.PI / 180);
                var y_component = Math.sin((this.player.angle) * Math.PI / 180);
                this.player.body.velocity.x += this.player.thrust * x_component;
                this.player.body.velocity.y += this.player.thrust * y_component;
                // Adjust turn rate if thrusting
                if (!this.cursors.right.isDown && !this.cursors.left.isDown) {
                    if (Math.abs(this.player.turnRate) <= this.player.MINTURNRATE) {
                        this.player.turnRate = 0;
                    } else if (this.player.turnRate > 0) {
                        this.player.turnRate -= this.player.turnIncrement;
                    } else {
                        this.player.turnRate += this.player.turnIncrement;
                    }
                }
            }
            // turn RIGHT
            if (this.cursors.right.isDown) {   //  Move to the right
                if (this.player.turnRate <= this.player.maxTurnRate) {
                    this.player.turnRate += this.player.turnIncrement;
                }
                this.player.angle += this.player.turnRate;
                this.isTurning = true;

            } // turn LEFT
            else if (this.cursors.left.isDown) {   //  Move to the left
                if (-this.player.turnRate <= this.player.maxTurnRate) {
                    this.player.turnRate -= this.player.turnIncrement;
                }
                this.player.angle += this.player.turnRate;
                this.isTurning = true;
            } // continue rotation
            else if (this.isTurning) {
                this.player.angle += this.player.turnRate;
            }
        }
    },

    // Ship max velocity
    constrainVelocity: function (sprite, maxVelocity) {
        if (!sprite || !sprite.body) {
            return;
        }
        var body = sprite.body;
        var angle, currVelocitySqr, vx, vy;
        vx = body.velocity.x;
        vy = body.velocity.y;
        currVelocitySqr = vx * vx + vy * vy;
        if (currVelocitySqr > maxVelocity * maxVelocity) {
            angle = Math.atan2(vy, vx);
            vx = Math.cos(angle) * maxVelocity;
            vy = Math.sin(angle) * maxVelocity;
            body.velocity.x = vx;
            body.velocity.y = vy;
        }
    },

    updateProjectiles: function() {
        //Player laser
        this.lasers.forEach(function (laser) {
            if (laser) {
                if (laser.lifespan < this.game.time.now) {
                    laser.kill();
                }
            }
        }, this);
        // Player missile
        this.missiles.forEach(function (missile) {
            if (missile) {
                // Calculate the angle from the missile to the mouse cursor game.input.x
                // and game.input.y are the mouse position; substitute with whatever
                // target coordinates you need.
                var targetAngle = this.game.math.angleBetween(
                    missile.x, missile.y,
                    this.alien.x, this.alien.y
                );

                // Add wobble effect
                targetAngle += this.game.math.degToRad(missile.wobble);

                // Accelerate missile then lock on and turn to find enemy
                if (missile.speed < missile.MAX_SPEED) {
                    missile.speed += missile.thrust;
                } else {
                    // Gradually (this.TURN_RATE) aim the missile towards the target angle
                    if (missile.rotation !== targetAngle) {
                        // Calculate difference between the current angle and targetAngle
                        var delta = targetAngle - missile.rotation;

                        // Keep it in range from -180 to 180 to make the most efficient turns.
                        if (delta > Math.PI) delta -= Math.PI * 2;
                        if (delta < -Math.PI) delta += Math.PI * 2;

                        if (delta > 0) {
                            // Turn clockwise
                            missile.angle += missile.TURN_RATE;
                        } else {
                            // Turn counter-clockwise
                            missile.angle -= missile.TURN_RATE;
                        }

                        // Just set angle to target angle if they are close
                        if (Math.abs(delta) < this.game.math.degToRad(missile.TURN_RATE)) {
                            missile.rotation = targetAngle;
                        }
                    }
                }

                missile.body.velocity.x = Math.cos(missile.rotation) * missile.speed;
                missile.body.velocity.y = Math.sin(missile.rotation) * missile.speed;

                if (missile.lifespan < this.game.time.now) {
                    this.detonate(missile, true, 100, false);
                }
                if (missile.launchtime < this.game.time.now) {
                    missile.animations.play('missile-cruise', 20, true);
                }
            }
        }, this);

        // Alien heat seeking bullet
        this.alien.bullets.forEach(function (bullet) {
            if (bullet) {
                if (this.game.physics.arcade.distanceBetween(bullet, this.alien.target) > this.alien.BULLETLOCKDISTANCE) {
                    this.game.physics.arcade.accelerateToObject(bullet, this.alien.target, this.alien.BULLETACCELERATION, this.alien.MAXBULLETSPEED, this.alien.MAXBULLETSPEED);
                } else {
                    this.game.physics.arcade.moveToObject(bullet, this.alien.target, parseInt(this.alien.target.body.speed) * 10);
                }
                if (bullet.lifespan < this.game.time.now) {
                    this.detonate(bullet, true, 100, false);
                }
            }
        }, this);
    },

    updateAlien: function () {
        this.alien.update();
    },

    updateAsteroids: function() {
        if (this.asteroids.countLiving() < this.TOTALASTEROIDS) {
            this.createAsteroid();
        }
    },

    applyGravity: function() {

        var inGravitationalField = false;

        this.planets.forEach(function (planet) {
            var planet_x = planet.x + planet.radius;
            var planet_y = planet.y + planet.radius;
            this.distanceFromPlanet = Math.sqrt(Math.pow(planet_x - this.player.body.x, 2) + Math.pow(planet_y - this.player.body.y, 2));
            var range = (planet.key != 'sun') ? this.GRAVITYRANGE : this.GRAVITYRANGE * 2.4;
            var gravity = this.GRAVITY;

            // Gravity
            if (this.distanceFromPlanet < range) {
                inGravitationalField = true;
                this.player.body.allowGravity = true;
                this.player.body.gravity = new Phaser.Point(planet_x - this.player.body.x, planet_y - this.player.body.y);
                this.player.body.gravity = this.player.body.gravity.normalize().multiply(gravity, gravity);
            }
        }, this);

        if (!inGravitationalField) {
            this.player.body.allowGravity = false;
        }

    },

    updateEpisode: function() { // @todo revise later
        //Alien appearance timer
        if (this.alienTimer < this.game.time.now) {
            this.alienTimer = this.game.time.now + this.alienInterval;
            if (this.aliens.countLiving() < this.TOTALALIENS) {
                this.alien = this.createAlien();
                this.aliens.add(this.alien);
                this.alien.map.revive();
            }
        }
    },

    updateTimers: function () {
        // Reload timer
        if (this.reloadTimer < this.game.time.now) {
            this.reloadTimer = this.game.time.now + this.player.RELOAD_INTERVAL;
            this.player.isReloaded = true;
        }
        // Recharge battery timer
        if (this.rechargeTimer < this.game.time.now) {
            this.rechargeTimer = this.game.time.now + this.player.RECHARGE_INTERVAL;
            if (this.player.charge < this.player.CHARGE) {
                this.player.charge++;
            }
            if (this.alien.charge < this.alien.MAXCHARGE){
                this.alien.charge++;
            }
            if (this.alien.tractorBeam < this.alien.MAXCHARGE){
                this.alien.tractorBeam++;
            }
        }
        // Recharge warp drive
        if (this.warpTimer < this.game.time.now) {
            this.warpTimer = this.game.time.now + this.player.WARP_INTERVAL;
            if (this.player.warpDrive < this.player.CHARGE) {
                this.player.warpDrive++;
            }
        }
    },

    checkCollisions: function() {
        this.game.physics.arcade.collide(this.missiles, this.asteroids, this.missileAsteroidHit, null, this);
        this.game.physics.arcade.collide(this.player, this.asteroids, this.playerAsteroidHit, null, this);
        this.game.physics.arcade.collide(this.player, this.alien, this.playerAlienHit, null, this);
        this.game.physics.arcade.collide(this.missiles, this.alien, this.missileAlienHit, null, this);
        this.game.physics.arcade.collide(this.missiles, this.planets, this.missilePlanetHit, null, this);
        this.game.physics.arcade.collide(this.asteroids, this.planets, this.asteroidPlanetHit, null, this);
        this.game.physics.arcade.collide(this.player, this.alien.bullets, this.playerBulletHit, null, this);
        this.game.physics.arcade.collide(this.planets, this.alien.bullets, this.planetBulletHit, null, this);
        this.game.physics.arcade.collide(this.asteroids, this.alien.bullets, this.asteroidBulletHit, null, this);
        this.game.physics.arcade.collide(this.missiles, this.alien.bullets, this.missileBulletHit, null, this);
        this.game.physics.arcade.collide(this.alien, this.asteroids, this.alienAsteroidHit, null, this);
        this.game.physics.arcade.collide(this.player, this.planets, this.playerPlanetHit, null, this);
        this.game.physics.arcade.collide(this.alien, this.planets, this.alienPlanetHit, null, this);
        this.game.physics.arcade.collide(this.lasers, this.alien, this.laserAlienHit, null, this);
    },

    createLaser: function(x, y, angle) {
        var laser = new Laser(this.game, this.LASERSCALE, x, y, angle);
        this.lasers.add(laser);
        laser.reset(this.player.x, this.player.y);
        laser.revive();
    },

    createMissile: function(x, y, angle) {
        var missile = new Missile(false, this.game, this.MISSILESCALE, x, y, angle);
        missile.animations.add('missile-launch', [0,1,0,1,0,1,2,1,2,3,2,3,4,5,4,5]);
        missile.animations.add('missile-cruise', [6,7,6]);
        this.missiles.add(missile);
        missile.checkWorldBounds = true;
        missile.reset(this.player.x, this.player.y);
        missile.revive();
        missile.animations.play('missile-launch', 8, true);
    },

    createNuke: function(x, y, angle) {
        var nuke = new Missile(true, this.game, this.NUKESCALE, x, y, angle);
        nuke.animations.add('missile-launch', [0,1,0,1,0,1,2,1,2,3,2,3,4,5,4,5]);
        nuke.animations.add('missile-cruise', [6,7,6]);
        this.missiles.add(nuke);
        nuke.checkWorldBounds = true;
        nuke.reset(this.player.x, this.player.y);
        nuke.revive();
        nuke.animations.play('missile-launch', 8, true);
    },

    createAlien: function() {
        var alien = this.aliens.getFirstDead();
        var start = this.game.rnd.integerInRange(1, 4);
        switch (start) {
            case 1:
                var x = this.game.world.bounds.width;
                var y = this.game.rnd.integerInRange(0, this.game.world.bounds.height);
                break;
            case 2:
                var x = 0;
                var y = this.game.rnd.integerInRange(0, this.game.world.bounds.height);
                break;
            case 3:
                var x = this.game.rnd.integerInRange(0, this.game.world.bounds.width);
                var y = this.game.world.bounds.height;
                break;
            case 4:
                var x = this.game.rnd.integerInRange(0, this.game.world.bounds.width);
                var y = 0;
                break;
        }

        if (alien) {
            alien.reset(x, y);
            alien.revive();
        } else {
            alien = new Alien(this.game, this.player, this.GAME_SCALE, x, y);
        }
        return alien;
    },

    createAsteroid: function () {
        var asteroid = this.asteroids.getFirstDead();
        if (!asteroid) {
            var start = this.game.rnd.integerInRange(1, 4);

            switch (start){
                case 1:
                    var x = this.game.world.bounds.width;
                    var y = this.game.rnd.integerInRange(0, this.game.world.bounds.height);
                    var direction = 1;
                    break;
                case 2:
                    var x = 0;
                    var y = this.game.rnd.integerInRange(0, this.game.world.bounds.height);
                    var direction = 2;
                    break;
                case 3:
                    var x = this.game.rnd.integerInRange(0, this.game.world.bounds.width);
                    var y = this.game.world.bounds.height;
                    var direction = 3;
                    break;
                case 4:
                    var x = this.game.rnd.integerInRange(0, this.game.world.bounds.width);
                    var y = 0;
                    var direction = 4;
                    break;
            }

            asteroid = new Asteroid(this.game, this.GAME_SCALE, x, y, direction);
            this.asteroids.add(asteroid);
        }

        asteroid.reset(asteroid.startX, asteroid.startY);
        asteroid.revive();
    },

    detonate: function (object, destroy, framerate, big) {
        if (big){
            var explosionAnimation = this.bigExplosions.getFirstExists(false);
            explosionAnimation.reset(object.x, object.y);
            explosionAnimation.play('big-explosion', framerate, false, true);
            this.bigExplosionSound.play('', 0, 0.8, false, true);
        } else {
            var explosionAnimation = this.explosions.getFirstExists(false);
            explosionAnimation.reset(object.x, object.y);
            explosionAnimation.play('explosion', framerate, false, true);
            this.explosionSound.play('', 0, 0.2, false, true);
        }

        if (destroy) {
            object.destroy();
        } else {
            object.kill();
        }
    },

    missilePlanetHit: function (missile, planet) {
        this.detonate(missile, false, 100, false);
    },

    asteroidPlanetHit: function (asteroid, planet) {
        this.detonate(asteroid, false, 100, false);
    },

    missileAsteroidHit: function(missile, asteroid) {
        this.detonate(missile, false, 100, false);
        this.detonate(asteroid, false, 100, false);
    },

    missileAlienHit: function(alien, missile) {
        this.missileSound.stop();
        this.nukeSound.stop();
        this.detonate(missile, false, 50, false);
        this.alien.health -= missile.damage;
    },

    laserAlienHit: function(alien, laser) {
        this.explosionSound.play('', 0, 0.5, false, true);
        laser.kill();
        this.alien.health -= laser.damage;
    },

    alienAsteroidHit: function(alien, asteroid) {
        this.detonate(asteroid, false, 100, false);
        this.alien.health -= asteroid.damage;
    },

    playerPlanetHit: function(ship, planet) {
        this.explosionSound.play('', 0, 0.1, false, true);
    },

    alienPlanetHit: function(ship, planet) {
        this.explosionSound.play('', 0, 0.1, false, true);
        this.alien.avoidObstacle();
    },

    planetBulletHit: function(planet, bullet) {
        this.detonate(bullet, true, 100, false);
    },

    asteroidBulletHit: function (asteroid, bullet){
        this.detonate(asteroid, false, 100, false);
        this.detonate(bullet, true, 100, false);
    },

    missileBulletHit: function (missile, bullet) {
        this.detonate(missile, true, 100, false);
        this.detonate(bullet, true, 100, false);
    },

    playerBulletHit: function (player, bullet) {

        if (this.player.isShielded){
            this.boingSound.play('', 0, 0.1, false);
            this.player.shieldStrength -= this.alien.BULLET_DAMAGE;
            bullet.destroy();
            return;
        }
        this.detonate(bullet, true, 50, false);

        // if player collides with anything while warping, increase damage
        if (this.player.isWarping){
            this.player.health -= this.alien.BULLET_DAMAGE * 3;
        } else {
            this.player.health -= this.alien.BULLET_DAMAGE;
        }
    },

    playerAsteroidHit: function (player, asteroid) {

        if (this.player.isShielded){
            this.boingSound.play('', 0, 0.1, false);
            this.player.shieldStrength -= asteroid.damage;
            return;
        }

        this.detonate(asteroid, false, 100, false);
        this.player.health -= asteroid.damage;

        // if player collides with anything while warping, increase damage
        if (this.player.isWarping){
            this.player.health -= asteroid.damage * 3;
        } else {
            this.player.health -= asteroid.damage;
        }
    },

    playerAlienHit: function () {
        this.explosionSound.play('', 0, 0.1, false, true);
        this.alien.avoidObstacle();
    },

    killPlayer: function(playerKilled){
        this.player.isAlive = false;
        this.gameMusic.stop();
        this.alien.tractorBeamSound.stop();
        this.explosionSound.play('', 0, 1, false, true);
        if (playerKilled) {
            var bigExplosionAnimation = this.bigExplosions.getFirstExists(false);
            bigExplosionAnimation.reset(this.player.x, this.player.y);
            this.player.kill();
        } else {
            var bigExplosionAnimation = this.bigExplosions.getFirstExists(false);
        }
        bigExplosionAnimation.play('big-explosion', 20, false, true).onComplete.add(function () {
            this.game.world.bounds = new Phaser.Rectangle(0, 0, this.game.width, this.game.height);
            this.game.camera.setBoundsToWorld();
            var scoreboard = new Scoreboard(this.game);
            scoreboard.show(this.player.cash, this.youBlewIt, this.explosionSound, false);
            if (this.warpLoopSound.isPlaying) {
                this.warpLoopSound.stop();
            }
            this.healthText.text = '';
            this.batteryText.text = '';
            this.shieldText.text = '';
            this.laserText.text = '';
            this.nukeText.text = '';
            this.missileText.text = '';
            this.warpText.text = '';
        }, this);
    },

    killAlien: function() {
        this.alien.isTractorBeamOn = false;
        this.alien.alive = false;
        this.alien.tractorBeamSound.stop();
        this.player.cash += this.KILL_ALIEN_SCORE;
        this.explosionSound.play('', 0, 1, false, true);
        this.bigExplosionSound.play('', 0, 1, false, true);
        var bigExplosionAnimation = this.bigExplosions.getFirstExists(false);
        bigExplosionAnimation.reset(this.alien.x, this.alien.y);
        bigExplosionAnimation.play('big-explosion', 500, false, true);
        this.alien.kill();
        this.alien.map.kill();
        this.player.aliensKilled++;
    },

    shutdown: function () {
        this.missiles.destroy();
        this.lasers.destroy();
        this.asteroids.destroy();
        this.explosions.destroy();
        this.bigExplosions.destroy();
        this.player.cash = 0;
        this.player.aliensKilled = 0;
        this.player.revive();
        this.map.revive();
        this.gameOver = false;
    }
}