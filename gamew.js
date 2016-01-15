window.onload = function() {	
	var game = new Phaser.Game(640, 480, Phaser.CANVAS);
	window.game = game;
	var bird;
     // bird gravity, will make bird fall if you don't flap
	var birdGravity = 0;
     // horizontal bird speed
	var birdSpeed = 600;
     // flap thrust
	var birdFlapPower = 10;
     // milliseconds between the creation of two pipes
	var pipeInterval = 10;
     // hole between pipes, in puxels
	var pipeHole = 120;
	var pipeGroup;
	var score=0;
	var scoreText;
  var topScore;
  var button;
  var space;
  var bassline;
  var snake;
  var beat = 800;
  var tick = beat / 480;
  var hexatic = 10;
     
  var play = function(game){}
     
  play.prototype = {
		preload:function(){
			game.load.image("bird", "newship.png");
			game.load.spritesheet("snakes", "snakes.png", 30, 30);
			game.load.spritesheet("snakes2", "snakes2.png", 30, 30);
			game.load.image("space", "background.png");	 
			game.load.image("pipe", "pipe.png");
			game.load.json("bassline", "example.json");	
			game.load.audio('theme', "theme.mp3");
		},

		create:function(){
			space = game.add.sprite(0,0,"space");
			//snake = game.add.tileSprite(20,290,60,30,"snakes");
			//snake.anchor.set(0.5);
			//game.physics.arcade.enable(snake);
			//snake.body.velocity.x = 0;
			//snake.body.velocity.y = 0;
			//pipeGroup = game.add.group();
			score = 0;
			//topScore = localStorage.getItem("topFlappyScore")==null?0:localStorage.getItem("topFlappyScore");
			scoreText = game.add.text(10,10,"-",{
				font:"bold 16px Arial",
				fill:"#FFFFFF"
			});
			
			var bassline = game.cache.getJSON('bassline');
			snakeGroup = game.add.group();
			music = game.add.audio('theme');
			music.play();
    	console.log(music);

			button = game.add.button(game.world.centerX - 95, 200, 'bird', gofull, this, 2, 2, 2);
    	button.input.useHandCursor = true;
			game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
			//game.input.onDown.add(gofull, this);


			game.stage.backgroundColor = "#87CEEB";
			game.stage.disableVisibilityChange = true;
			game.physics.startSystem(Phaser.Physics.ARCADE);
			bird = game.add.sprite(80,240,"bird");

			//console.log(bassline.tracks[0]);
			buildStage(bassline.tracks[0]);

			bird.anchor.set(0.5);
			game.physics.arcade.enable(bird);
			bird.body.setSize(50, 20, 20, 0);
			game.time.advancedTiming = true;
			console.log(game.time);
			// bird.body.gravity.y = birdGravity;
			// game.input.onDown.add(flap, this);
			//console.log(game.input.activePointer);
			// game.time.events.loop(pipeInterval, addPipe); 
			// addPipe();
			game.time.events.loop(pipeInterval, moveSnakes); 
		},

		update:function(){
			//Phaser.Rectangle.intersects(snake.body, bird.body)?co():noCo();
			updateScore();
			space.x -= 0.2;
			bird.y = game.input.y;

			
		},

		render: function(){
			//console.log(music);

			game.debug.inputInfo(32, 32);
			game.debug.body(bird);
    	game.debug.body(snake);
    	game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");   

		},

	}

	function moveSnakes(){
		snakeGroup.children.forEach(function(snake) {
    	snake.children.forEach(function(segment) {
    	// game.physics.arcade.collide(item, platforms);
    	// game.physics.arcade.overlap(player, item, gameOver);
	    	segment.x -= 6;
			}, this);

		}, this);
	}

	function buildStage(track){
		//console.log(track);
		var onNotes = [];
		var ticksElapsed = 0;
		var lowestNote = null;
		var highestNote = null;

		//get range parameters
		for (i = 0; i < track.length; i++) {
			if (track[i].noteNumber > highestNote){
    		highestNote = track[i].noteNumber;
    	}
    	if (lowestNote == null || track[i].noteNumber < lowestNote) {
    		lowestNote = track[i].noteNumber;
    	}
    }

    //total semitone tracks between lowest and highest note in a section
    var range = highestNote - lowestNote;
    var spectrum = range + 2;

    //add two tracks as padding
    var division = game.height / (range + 2);

		for (i = 0; i < track.length; i++) {
    	//console.log(track[i]);
    	//console.log(track[i].type);
    	if(track[i].type === "channel"){
    		ticksElapsed += track[i].deltaTime;
    		//console.log(ticksElapsed)
    		if(track[i].subtype === "noteOn"){
    			//Gumbop
    			//console.log("i is" + i);
    			onNotes.push([track[i].noteNumber, ticksElapsed]);

    		} else if(track[i].subtype === "noteOff") {
    			for(var j = 0; j < onNotes.length; j++) {
    				//console.log(track[i].noteNumber);
    				if(track[i].noteNumber === onNotes[j][0]){
    					//console.log("track[i] noteOff deltaTime is " + track[i].deltaTime);
    					//console.log("matched notenum saved actual time is " + onNotes[j][1]);
    					//console.log("total time elapsed is: " + ticksElapsed);

    					var duration =  ticksElapsed - onNotes[j][1];
    					//console.log("duration is: " + duration);
    					var startTime = onNotes[j][1];
    					//console.log("start time is: " + startTime);
    					//put a snake in a track and offset by one
    					var chuteNum = onNotes[j][0] - lowestNote;

    					var verticalPosition = (game.height - division) - (chuteNum * division);

    					// ((onNotes[j][0] - lowestNote) * division) + division;
    					snake = new Snake(game,duration,30,-birdSpeed, onNotes[j][1], verticalPosition);
							game.add.existing(snake);
							snakeGroup.add(snake);
    					onNotes.splice(j, 1);
    				}
    			}
    		}
    	}
		}
		// console.log(onNotes);
		// console.log(snakeGroup.children[1]);
		// console.log(highestNote - lowestNote);
		// console.log(snakeGroup.children)
		// snakeGroup.children.forEach(function(snake) {
  //   	// game.physics.arcade.collide(item, platforms);
  //   	// game.physics.arcade.overlap(player, item, gameOver);
  //   	console.log(snake);
		// }, this);
		// children.setAll('body.velocity.x', -500);
	}

	Snake = function (game, x, y, speed, xpos, ypos) {

		// console.log("this snalke is this wide: " + x);
		// console.log("the horizontal location is: " + xpos);
		xpos += 1000;
		Phaser.Group.call(this, game);
		//console.log(this);

		this.physicsBodyType = Phaser.Physics.ARCADE;
		this.enableBody = true;

		segments = x / 30;
		//console.log("this snake has X segments: " + segments);

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

		// segment = new Segment(game,x,y,speed, xpos, ypos);
		// game.add.existing(segment);
		// this.add(segment);
		//var gumbop = Phaser.Tilemap.call(game, "snakes", 30, 30, 10, 1);
		//console.log(gumbop);
		//Phaser.TileSprite.call(game, xpos, ypos, x, y, key, 0)
		//Phaser.Sprite.call(this, game, x, y, "snakes");
		// game.physics.enable(this, Phaser.Physics.ARCADE);
		// this.x = xpos + 300;
		// this.y = ypos;
		//this.body.velocity.x = speed;
		// this.anchor.set(0.5);
		//console.log(this);
	};

	Snake.prototype = Object.create(Phaser.Group.prototype);
	Snake.prototype.constructor = Snake;
	
	Snake.prototype.update = function() {
		// if(this.x+this.width<bird.x && this.giveScore){
		// 	score+=0.5;
		// 	updateScore();
		// 	this.giveScore = false;
		// }
		// console.log(this.getBounds());
		if(Phaser.Rectangle.intersects(this.getBounds(), bird.body)){
			co();
		}
		if(this.x<-this.width){
			this.destroy();
		}
	};	

	Segment = function (game, x, y, speed, xpos, ypos, type) {
		
		//console.log(type);
		Phaser.TileSprite.call(this, game, xpos, ypos, x, y, 'snakes', type);
		//var gumbop = Phaser.Tilemap.call(game, "snakes", 30, 30, 10, 1);
		//console.log(gumbop);
		//Phaser.TileSprite.call(game, xpos, ypos, x, y, key, 0)
		//Phaser.Sprite.call(this, game, x, y, "snakes");
		game.physics.enable(this, Phaser.Physics.ARCADE);
		this.x = xpos;
		this.y = ypos;
		this.body.velocity.x = 0;
		this.anchor.set(0.5);
		//console.log(this);
	};

	Segment.prototype = Object.create(Phaser.TileSprite.prototype);

	Segment.prototype.constructor = Segment;
	
	Segment.prototype.update = function() {
		console.log("this shit never happens");
		// if(this.x+this.width<bird.x && this.giveScore){
		// 	score+=0.5;
		// 	updateScore();
		// 	this.giveScore = false;
		// }
		//Phaser.Rectangle.intersects(this.body, bird.body)?co():noCo();
		if(this.x<-this.width){
			console.log("something happened");
			this.destroy();
		}
	};


	function co(){
		score += 1;
	}

	function noCo(){
		console.log("no collision");
	}

	var menu = function(game){}
     
  menu.prototype = {
		preload:function(){
			game.load.image("bird", "newship.png");
			game.load.image("space", "background.png");	 
		},

		create:function(){
			space = game.add.sprite(0,0,"space");
			button = game.add.button(game.world.centerX - 95, 200, 'bird', doThing, this, 2, 2, 2);
		},

		update:function(){
		},

		render: function(){
		},

	}
     
  game.state.add("Menu",menu);
  game.state.start("Menu");
     
  function updateScore(){
		scoreText.text = "Score: "+score+"\nBest: "+topScore;	
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
     
	function flap(){
		bird.y = game.input.y;
	}
	
	// function addPipe(){
	// 	var pipeHolePosition = game.rnd.between(50,430-pipeHole);
	// 	var upperPipe = new Pipe(game,320,pipeHolePosition-480,-birdSpeed);
	// 	game.add.existing(upperPipe);
	// 	pipeGroup.add(upperPipe);
	// 	var lowerPipe = new Pipe(game,320,pipeHolePosition+pipeHole,-birdSpeed);
	// 	game.add.existing(lowerPipe);
	// 	pipeGroup.add(lowerPipe);
	// }
	
	function die(){
		// localStorage.setItem("topFlappyScore",Math.max(score,topScore));	
		// game.state.start("Play");	
		console.log("die");
	}
	
	Pipe = function (game, x, y, speed) {
		Phaser.Sprite.call(this, game, x, y, "pipe");
		game.physics.enable(this, Phaser.Physics.ARCADE);
		//this.body.velocity.x = speed;
		this.giveScore = true;	
	};
	
	Pipe.prototype = Object.create(Phaser.Sprite.prototype);
	Pipe.prototype.constructor = Pipe;
	
	Pipe.prototype.update = function() {

		if(this.x+this.width<bird.x && this.giveScore){
			score+=0.5;
			updateScore();
			this.giveScore = false;
		}
		if(this.x<-this.width){
			this.destroy();
		}
	};	
}