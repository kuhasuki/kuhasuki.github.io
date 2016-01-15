window.onload = function() {	
	var game = new Phaser.Game(800, 600, Phaser.CANVAS);
	window.game = game;
	var bird;
   
	var birdGravity = 0;
   
	var birdSpeed = 600;
   
	var birdFlapPower = 10;
   
	var pipeInterval = 10;
   
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
  var bassline;
  var snakeSegments = [];
  var just = 0;
  var now = 0;
  var deltime = 0;
  var secondRoundWait = false;
  var thirdRoundWait = false;
     
  var play = function(game){}
     
  play.prototype = {
		preload:function(){
			game.load.image("bird", "newship.png");
			game.load.spritesheet("snakes", "snakes.png", 30, 30);
			game.load.spritesheet("snakes2", "snakes2.png", 30, 30);
			game.load.image("space", "background.png");	 
			game.load.image("pipe", "pipe.png");
			game.load.json("bassline", "example.json");	
			game.load.json("accompaniment", "accompaniment.json");
			game.load.json("melody", "melody.json");
			game.load.audio('theme', "theme.mp3");
		},

		create:function(){
			space = game.add.sprite(0,0,"space");

			score = 0;
			scoreText = game.add.text(10,10,"-",{
				font:"bold 16px Arial",
				fill:"#FFFFFF"
			});
			
			bassline = game.cache.getJSON('bassline');

			snakeGroup = game.add.group();
			music = game.add.audio('theme');
			game.time.events.add(3000, playSong);
    	console.log(music);

			button = game.add.button(game.world.centerX - 95, 200, 'bird', gofull, this, 2, 2, 2);
    	button.input.useHandCursor = true;
			game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
	
			loreText = game.add.text(10,300,"",{
				font:"bold 16px Arial",
				fill:"#FFFFFF"
			});


			game.stage.backgroundColor = "#87CEEB";
			game.stage.disableVisibilityChange = true;
			game.physics.startSystem(Phaser.Physics.ARCADE);
			bird = game.add.sprite(80,240,"bird");

	
			buildStage(bassline.tracks[0]);
			setSnakeMover();
			bird.anchor.set(0.5);
			game.physics.arcade.enable(bird);
			//bird.body.velocity.x = 625;
			//game.camera.follow(bird.body);

			bird.body.setSize(50, 20, 20, 0);
			game.time.advancedTiming = true;
			console.log(game.time);
			console.log(music);

			//end of section 1
			game.time.events.add((beat * 24) + 3000, newSection);

			game.time.events.add((beat * 48) + 560, beginRound2);

			game.time.events.add((beat * 72) + 3000, newSection2);

			game.time.events.add((beat * 96) + 560, beginRound3);

			game.time.events.add((beat * 144) + 3000, showScore);

			//every 12 ticks
			//game.time.events.loop(2*hexatic, test2);
			
	
	
	
	
			// game.time.events.loop(pipeInterval, moveSnakes); 
		},

		update:function(){
	
			// updateScore();
			space.x -= 0.2;
			bird.y = game.input.y;
			//snakeGroup.y -= game.time.physicsElapsedMS;
			just = now;
			now = music.currentTime;
			deltime = now - just;
			if(!music.isPlaying){
				moveSnakes(15);
			} else if(secondRoundWait){
				moveSnakes(0);
			} else if(thirdRoundWait){
				moveSnakes(0);
			} else {
				moveSnakes(deltime);
			}
			
		},

		render: function(){
	

			// game.debug.inputInfo(32, 32);
			game.debug.body(bird);
    	game.debug.body(snake);
    	game.debug.text(game.time.fps || '--', 2, 14, "#00ff00");   

		},

	}

	

	function playSong(){
		music.play();
	}
	
	function newSection(){
		console.log("section over fucks");
		showScore();
		showLore(1);
		snakeGroup.destroy();
		snakeGroup = game.add.group();
		accompaniment = game.cache.getJSON('accompaniment');
		buildStage(accompaniment.tracks[0]);
		setSnakeMover();
		secondRoundWait = true;
	}

	function beginRound2(){
		hideLore();
		secondRoundWait = false;
	}

	function newSection2(){
		console.log("section over fucks");
		showScore();
		showLore(2);
		snakeGroup.destroy();
		snakeGroup = game.add.group();
		melody = game.cache.getJSON('melody');
		buildStage(melody.tracks[0]);
		setSnakeMover();
		thirdRoundWait = true;
	}

	function beginRound3(){
		hideLore();
		thirdRoundWait = false;
	}

	function test2(){
		console.log("20ms");
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
							game.add.existing(snake);
							snakeGroup.add(snake);
							//console.log(snake);
							
							game.time.events.add((ticksElapsed * ( 5/2)) + 2000, function() { awakenSnake(snake); });
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
		this.awake = false;
	};

	Snake.prototype = Object.create(Phaser.Group.prototype);

	Snake.prototype.constructor = Snake;
	
	Snake.prototype.update = function() {

		// if(this.x<900&&this.x<1200){

		// 	console.log("DHFDILUHIUHW:IUWE:FUBW");
		// 	this.exists = true;
		// }
		if(this.x<200){
			if(Phaser.Rectangle.intersects(this.getBounds(), bird.body)){
				co();
			}
		}
	};	

	Segment = function (game, x, y, speed, xpos, ypos, type) {
		

		Phaser.TileSprite.call(this, game, xpos, ypos, x, y, 'snakes', type);




		//game.physics.enable(this, Phaser.Physics.ARCADE);
		this.x = xpos;
		this.y = ypos;
		//this.body.velocity.x = 0;
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
		//console.log(snake);
	}

	function noCo(){
		//console.log("no collision");
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
     
  function showScore(){
  	var percent = parseFloat(score / 10);
		scoreText.text = "Score: "+percent+"%";	
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