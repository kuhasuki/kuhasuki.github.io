window.onload = function() {	

	var game = new Phaser.Game(960, 540, Phaser.CANVAS);

	window.game = game;
	var birdSpeed = 600;

	var ship;
	var score=0;
	var score1 = 0;
	var score2 = 0;
	var score3 = 0;
	var scoreText;
  var topScore;
  var button;
  var beats;
  var lastRounded;
  var roundedTicks;

  var space;
  var adjustment = 0;
  var adjustment2 = 0;
  var bassline;
  var snake;
  var slash;
  var currentSnake = {};
  var previousSnake;
  var beat = 800;
  var tick = beat / 480;
  var hexatic = 10;
  var accompaniment;
  var melody;
  var snakeSegments = [];
  var just = 0;
  var now = 0;
  var deltime = 0;
  var secondRoundWait = false;
  var thirdRoundWait = false;
  var isColliding = false;

     
  var play = function(game){}
     
  play.prototype = {
		preload:function(){
			// game.canvas.style.cursor = 'inherit';
			// document.querySelector('CANVAS').style.cursor = "none";
			game.load.image("bird", "newship.png");
			game.load.spritesheet("snakes", "snakes.png", 30, 30);
			game.load.spritesheet("snakes2", "snakes2.png", 30, 30);
			game.load.spritesheet("slash", "slice.png", 128, 128, 16);
			
			game.load.image("space", "background.png");	 
			game.load.image("pipe", "pipe.png");
			game.load.json("bassline", "example.json");	
			game.load.json("accompaniment", "accompaniment.json");
			game.load.json("melody", "melody.json");
			game.load.audio('theme', "theme.mp3");
			scoreText = game.add.text(10,10,"Use the mouse to move your ship, hit the snakes to get points",{
				font:"bold 16px Arial",
				fill:"#FFFFFF"
			});
		},

		create:function(){
			space = game.add.sprite(0,0,"space");

			score = 0;
			scoreText = game.add.text(10,10,"Use the mouse to move your ship, hit the snakes to get points",{
				font:"bold 16px Arial",
				fill:"#FFFFFF"
			});
			game.time.events.add(4000, function(){
				scoreText.text = "";
			});
		
			game.stage.backgroundColor = "#000000";
			game.stage.disableVisibilityChange = true;
			game.physics.startSystem(Phaser.Physics.ARCADE);

			ship = game.add.sprite(80,240,"bird");
			ship.anchor.set(0.5);
			game.physics.arcade.enable(ship);
			ship.body.setSize(50, 20, 20, 0);

			snakeGroup = game.add.group();

			music = game.add.audio('theme');

			button = game.add.button(750, 10, 'fullscreen', gofull, this, 2, 2, 2);
    	button.input.useHandCursor = true;

			game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
	
			loreText = game.add.text(10,300,"",{
				font:"bold 16px Arial",
				fill:"#FFFFFF"
			});

			game.time.events.add(3000, playSong);

			bassline = game.cache.getJSON('bassline');
			buildStage(bassline.tracks[0]);
			setSnakeMover();


						// slice = game.add.tileSprite(200, 360, 'snakes2', 5);
   //  	slice.scale.set(4);
   //  	slice.smoothed = false;
   		slash = game.add.sprite(-20, 0, 'slash');
			slash.frame = 3;
			slashOn = slash.animations.add('slashOn', [12, 8, 4, 0], 10, true);
			slashHold = slash.animations.add('slashHold', [13, 9, 5, 1, 14, 10, 6, 2], 20, true);
			slashOff = slash.animations.add('slashOff', [15, 11, 7, 3], 10, true);
			// slash.animations.play('slashHold');
			// slice = game.add.slash(15, 30, 'slice');
			// slice.frame = 1;
	
		
			game.time.advancedTiming = true;

			game.time.events.add((beat * 24) + 3000, newSection);

			game.time.events.add((beat * 48) + 560, beginRound2);

			game.time.events.add((beat * 72) + 3000, newSection2);

			game.time.events.add((beat * 96) + 560, beginRound3);

			game.time.events.add((beat * 144) + 3000, end);

			
			//slice.frame = 3;
			//slice.anchor.set(0.5);
			//game.physics.arcade.enable(slice);
			//slice.animations.add('left', [0, 1, 2, 3], 10, true);
			//slice.animations.add('right', [5, 6, 7, 8], 10, true);
			//slice.animations.play('left');


		},

		update:function(){
			space.x -= 0.2;
			ship.y = game.input.y;
			slash.y = game.input.y - 60;
			just = now;
			now = music.currentTime;
			deltime = now - just;
			if(!music.isPlaying){
				moveSnakes(15);
			} else if(secondRoundWait){
				slash.visible = false;
				moveSnakes(0);
			} else if(thirdRoundWait){
				moveSnakes(0);
			} else {
				moveSnakes(deltime);
			}

			setCurrentSnake();

			if(isColliding){
				slash.visible = true;
				slash.animations.play('slashHold');
			} else {
				slash.visible = false;
				//slashHold.stop;
			}
			
		},

		render: function(){
	

			// game.debug.inputInfo(32, 32);
			//game.debug.body(snakeGroup.children[0]);
    	//game.debug.body(ship);
    	//document.querySelector('CANVAS').style.cursor = "none";
    	//game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");   

		},

	}

	

	function playSong(){
		music.play();
	}

	if(typeof Math.roundTo === "undefined") {
    Math.roundTo = function(num, step) { 
        return Math.floor((num / step) + .5) * step; 
    } 
	}

		// Math.roundTo(15, 10); // >> 20 
		// Math.roundTo(14.99, 10); // >> 10 
		// Math.roundTo(42, 1); // >> 42

	function bump(){
		loreText.text = "snake";
	}	

	function setCurrentSnake(){
	 	beats = (now-adjustment) / beat;
		lastRounded = roundedTicks;
		var preTicks = beats * 480;
		preTicks -= adjustment2;
		roundedTicks = Math.roundTo(preTicks + 259, 120);
		//console.log(roundedTicks);
		if(lastRounded != roundedTicks){
			for (var i = 0; i < snakeGroup.children.length; i++){
				if(snakeGroup.children[i].ticksElapsed == roundedTicks){
					previousSnake = currentSnake;
					currentSnake = snakeGroup.children[i];
					// console.log("snake change");
					// console.log(currentSnake.getBounds());
					// console.log(ship.getBounds());
					//bump();
				}
			}
		} else {
			//loreText.text = "";
		}
	}
	function hideSlash(){
		slash.visible = false;
		// console.log("FUFUFUFUFUFUFUF");
	}

	function newSection(){
		score1 = score;
		showScore();
		score = 0;
		showLore(1);
		//game.time.events.add(1000, hideSlash);
		game.world.sendToBack(slash);
		// slash.sendToBack();
		snakeGroup.destroy();
		snakeGroup = game.add.group();
		accompaniment = game.cache.getJSON('accompaniment');
		buildStage(accompaniment.tracks[0]);
		setSnakeMover();
		secondRoundWait = true;
	}

	function beginRound2(){
		adjustment2 = 8880;
		console.log(snakeGroup.children);
		console.log(music.currentTime);
		hideLore();
		adjustment = ((music.currentTime / 800) * 480) + 2200;
		secondRoundWait = false;
		setTimeout(function(){slash.bringToTop();}, 2500);
	}

	function newSection2(){
		score2 = score;
		showScore();
		score = 0;
		game.world.sendToBack(slash);
		adjustment = ((music.currentTime / 800) * 480) + 2200;
		adjustment2 = (8880 * 2) + 6000;
		console.log("section over fucks");
		showLore(2);
		snakeGroup.destroy();
		snakeGroup = game.add.group();
		melody = game.cache.getJSON('melody');
		buildStage(melody.tracks[0]);
		setSnakeMover();
		thirdRoundWait = true;
		// game.time.events.add(2000, hideSlash);
		// setTimeout(function(){slash.bringToTop}, 1000);
	}

	function beginRound3(){
		hideLore();
		thirdRoundWait = false;
		setTimeout(function(){slash.bringToTop();}, 2500);
	}

	function end(){
		score3 = score;
		score = 0;
		showFinalScore(score1, score2, score3);
	}

	function setSnakeMover(){
		// console.log(music.currentTime);
		//var tiqs = music.currentTime / (5 / 3);
		// var move = distance / (5 / 3);
		//console.log(tiqs);
		snakeSegments = [];


		snakeGroup.children.forEach(function(snake) {
    	snake.children.forEach(function(segment) {
   			
   
	    	snakeSegments.push(segment);
			}, this);

		}, this);
	}


	function moveSnakes(distance){
		// console.log(music.currentTime);
		//var tiqs = music.currentTime / (5 / 3);
		var move = distance / (5 / 3);

		for(var i=0; i < snakeSegments.length; i++){
			snakeSegments[i].body.x -= move;
		}
		//console.log(tiqs);
		// snakeGroup.children.forEach(function(snake) {
  //   	snake.children.forEach(function(segment) {
   			
   
	    	//segment.x -= move;
		// 	}, this);

		// }, this);
	}

	function buildStage(track){

		var onNotes = [];
		var ticksElapsed = 0;
		var lowestNote = null;
		var highestNote = null;


		for (i = 0; i < track.length; i++) {
			if (track[i].noteNumber > highestNote){
    		highestNote = track[i].noteNumber;
    	}
    	if (lowestNote == null || track[i].noteNumber < lowestNote) {
    		lowestNote = track[i].noteNumber;
    	}
    }

  
    var range = highestNote - lowestNote;
    var spectrum = range + 2;

  
    var division = game.height / (range + 2);

		for (i = 0; i < track.length; i++) {
   
   
    	if(track[i].type === "channel"){
    		ticksElapsed += track[i].deltaTime;
    
    		if(track[i].subtype === "noteOn"){
    	
    	
    			onNotes.push([track[i].noteNumber, ticksElapsed]);

    		} else if(track[i].subtype === "noteOff") {
    			for(var j = 0; j < onNotes.length; j++) {
    		
    				if(track[i].noteNumber === onNotes[j][0]){
    			
    			
    			

    					var duration =  ticksElapsed - onNotes[j][1];
    			
    					var startTime = onNotes[j][1];
    			
    			
    					var chuteNum = onNotes[j][0] - lowestNote;

    					var verticalPosition = (game.height - division) - (chuteNum * division);

    			
    					snake = new Snake(game,duration,30,-birdSpeed, onNotes[j][1], verticalPosition, ticksElapsed);
    					snake.z = 5;
							game.add.existing(snake);
							snakeGroup.add(snake);

							//console.log(snake);
							
							//game.time.events.add((ticksElapsed * ( 5/2)) + 2000, function() { awakenSnake(snake); });
							//console.log(snake);
    					onNotes.splice(j, 1);
    				}
    			}
    		}
    	}
		}










	}

	function awakenSnake(snake){
		//if(snake.x < 0){
			console.log(snake.x)
		// console.log(snake);
		// snake.destroyChildren = true;
		// snake.destroy();
		// console.log("destruction occured");
		//}
	}

	Snake = function (game, x, y, speed, xpos, ypos, ticksElapsed) {

		xpos += 1600;
		Phaser.Group.call(this, game);

		this.physicsBodyType = Phaser.Physics.ARCADE;
		this.enableBody = true;
		this.ticksElapsed = ticksElapsed;

		segments = x / 30;

		for(var i = 0; i < segments; i++){
			var changeFactor = i * 30;
			if(i === 0){
				segment = new Segment(game,30,30,speed, xpos, ypos, 0);
				game.add.existing(segment);
				this.add(segment);
			} else if(i === segments - 1){
				segment = new Segment(game,30,30,speed, xpos + changeFactor, ypos, 5);
				game.add.existing(segment);
				this.add(segment);
			} else {
				segment = new Segment(game,30,30,speed, xpos + changeFactor, ypos, 1);
				game.add.existing(segment);
				this.add(segment);
			}
		}
		//this.awake = false;
	};

	Snake.prototype = Object.create(Phaser.Group.prototype);

	Snake.prototype.constructor = Snake;
	
	Snake.prototype.update = function() {
		if(this === currentSnake){
			if(Phaser.Rectangle.intersects(this.getBounds(), ship.body)){
				co();
			} else {
				noCo();
			}
		} else if(this === previousSnake){
			if(Phaser.Rectangle.intersects(this.getBounds(), ship.body)){
				co();
			}
		}
	};	

	Segment = function (game, x, y, speed, xpos, ypos, type) {
		Phaser.TileSprite.call(this, game, xpos, ypos, x, y, 'snakes', type);
		game.physics.enable(this, Phaser.Physics.ARCADE);
		this.x = xpos;
		this.y = ypos;
		this.body.velocity.x = 0;
		this.anchor.set(0.5);

	};

	Segment.prototype = Object.create(Phaser.TileSprite.prototype);

	Segment.prototype.constructor = Segment;
	
	Segment.prototype.update = function() {

		console.log("this shit never happens");
		// Phaser.Rectangle.intersects(this.body, bird.body)?co():noCo();
		if(this.x<-this.width){
			console.log("something happened");
			this.destroy();
		}
	};


	function co(){
		score += 1;
		isColliding = true;
	}

	function noCo(){
		isColliding = false;
		//console.log("no collision");
	}

	var boot = function(game){}

	boot.prototype = {

  init: function () {
  },

  preload: function () {
    this.load.image('loadingBar', 'bar.jpg');
   //  loadingText = game.add.text(10,10,"LOADING",{
			// 	font:"bold 16px Arial",
			// 	fill:"#FFFFFF"
			// });
  },

  create: function () {
  	game.state.add("Menu", menu);
    this.state.start('Menu');
  }

}

	var menu = function(game){}
     
  menu.prototype = {
		preload:function(){
			//game.load.image("why", "pipe.png");
			loadingText = game.add.text(10,10,"LOADING... turn up your sound to fully enjoy the game!",{
				font:"bold 16px Arial",
				fill:"#FFFFFF"
			});

			this.loadingBar = this.add.sprite(0, 40, "loadingBar");
    	this.load.setPreloadSprite(this.loadingBar);

			game.load.audio('theme', "theme.mp3"); 
			game.load.image("bird", "start.png");
			game.load.image("bird", "newship.png");
			game.load.image("fullscreen", "fullscreen.png");	
			game.load.spritesheet("snakes", "snakes.png", 30, 30);
			game.load.spritesheet("snakes2", "snakes2.png", 30, 30);
			game.load.spritesheet("slash", "slice.png", 128, 128, 16);
			
			game.load.image("space", "snakes.jpg");	 
			game.load.image("space", "background.png");	 
			//game.load.image("pipe", "pipe.png");
			game.load.json("bassline", "example.json");	
			game.load.json("accompaniment", "accompaniment.json");
			game.load.json("melody", "melody.json");
		},

		create:function(){
			game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
			game.load.onLoadStart.add(loadStart, this);
    	//game.load.onFileComplete.add(fileComplete, this);
    	game.load.onLoadComplete.add(loadComplete, this);
			space = game.add.sprite(0,0,"space");
			button = game.add.button(game.world.centerX - 210, 420, 'bird', doThing, this, 2, 2, 2);
			button = game.add.button(game.world.centerX + 10, 420, 'fullscreen', gofull, this, 2, 2, 2);
		},

		update:function(){

			//slash.y = game.input.y
		},

		render: function(){

		},

		loadStart: function(){
		console.log(game.load.progress);
		console.log("load started");
	},
	loadComplete: function(){
		console.log("load started");
	},
	fileComplete: function(){
		console.log("load started");
	},


	}

	function loadStart(){
		console.log("load started");
	}

	function loadComplete(){
		console.log("load started");
	}
     
  game.state.add("Boot", boot);
  game.state.start("Boot");
     
  function showScore(){
  // 	var percent = parseFloat(score / 10);
		// scoreText.text = "Score: "+percent+"%";	
		scoreText.text = "Round score: "+score+" points";
	}
	  function showFinalScore(uno, dos, tres) {
  // 	var percent = parseFloat(score / 10);
		// scoreText.text = "Score: "+percent+"%";	
		scoreText.text = "Bassline Score: "+uno+" points \n Accompaniment Score: "+dos+" points \n Melody Score: "+tres+" points \n Total: "+(uno+dos+tres)+" points";
	}


	function showLore(part){
  	// var percent = parseFloat(score / 10);
  	if(part == 1){
			loreText.text = "In a distant quadrant of space, \nthere resides a civilization. \nA hyper-intelligent and telepathic race of super hamsters \nhave found in thier exploration of the dark abyss,\n that what they thought were 'black-holes' \n were actually snake eggs.";	
		}else if(part == 2){
			loreText.text = "Equipped with ship-knives \n brave fighter pilots wield the power \n of destructive harmonic energy \n to deconstruct the snakes before they devour \n thier home planet";
		}
	}

	function hideLore(part){
  	// var percent = parseFloat(score / 10);
		loreText.text = "";	
	}

	function gofull() {

    if (game.scale.isFullScreen)
    {
        game.scale.stopFullScreen();
    }
    else
    {
        game.scale.startFullScreen(false);
    }

	}

		function doThing() {
 			game.state.add("Play",play);
  		game.state.start("Play");
	}

}