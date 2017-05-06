// Population stats
var maxspeed = 3;
var calPerSec = 1;
var creatureSize = 40;
var reproThresh = 0.0001;
var vision = 3;
var appetite = 10;

// Hold array for each creature species
var rabbits = [];
var wolves = [];
var grass = [];

// Stats for every species
grassStats = {
	rank: 1,
	diameter: creatureSize*0.4,
  reproThresh: reproThresh * 0.5,
  hunger: 0, // maybe grass doesn't need hunger and appetite...
  appetite: appetite*0.4,
	visionRadius: vision,
	maxspeed: 0,
	startingDiet: 5,
	calorieBurnRate: calPerSec,
  color: '#00AA5B',
	health: 100
}

rabbitStats = {
	rank: 2,
	diameter: creatureSize*0.6,
  reproThresh: reproThresh,
  hunger: 0,
  appetite: appetite*0.6,
	visionRadius: vision,
	maxspeed: maxspeed,
	startingDiet: 5,
	calorieBurnRate: calPerSec,
  color: '#55555B',
	health: 100
}

wolfStats = {
	rank: 3,
	diameter: creatureSize,
  reproThresh: reproThresh * 0.2,
  hunger: 0,
  appetite: appetite,
	visionRadius: vision,
	maxspeed: maxspeed,
	startingDiet: 25,
	calorieBurnRate: calPerSec,
  color: '#AA555B',
	health: 200
}

grassDNA = [grassStats['rank'], grassStats['diameter'], grassStats['reproThresh'], grassStats['hunger'],
grassStats['appetite'], grassStats['visionRadius'], grassStats['maxspeed'], grassStats['startingDiet'],
grassStats['calorieBurnRate'], grassStats['color'], grassStats['health']]

rabbitDNA = [rabbitStats['rank'], rabbitStats['diameter'], rabbitStats['reproThresh'], rabbitStats['hunger'],
rabbitStats['appetite'], rabbitStats['visionRadius'], rabbitStats['maxspeed'], rabbitStats['startingDiet'],
rabbitStats['calorieBurnRate'], rabbitStats['color'], rabbitStats['health']]

wolfDNA = [wolfStats['rank'], wolfStats['diameter'], wolfStats['reproThresh'], wolfStats['hunger'],
wolfStats['appetite'], wolfStats['visionRadius'], wolfStats['maxspeed'], wolfStats['startingDiet'],
wolfStats['calorieBurnRate'], wolfStats['color'], wolfStats['health']]

//Array of all species
var worldDNA = [wolfDNA, rabbitDNA, grassDNA];

function createCreature(event) {
  //log location
    downX = event.pageX;
    downY = event.pageY;
    //rabbits.push(new Creature(createVector(downX,downY), worldDNA[1])); //just rabbits
    //
    // randomly generate
    newPick = int(random(3)); // pick a 0, 1, or 2
    console.log(newPick);
    //
    if (newPick==0) {
        wolves.push(new Creature(createVector(downX,downY), worldDNA[newPick]));
    } else if (newPick==1) {
        rabbits.push(new Creature(createVector(downX,downY), worldDNA[newPick]));
    } else if (newPick==2) {
        grass.push(new Creature(createVector(downX,downY), worldDNA[newPick]));
    }

}
document.addEventListener("mousedown", createCreature);

function newWorld() {
	if (rabbits.length == 0 || wolves.length == 0) {
		location.reload();
	}
}

// Setup and initialize ecosystem
function setup() {
  createCanvas(900, 900);

  // Initialize creatures
  for (var i = 0; i < 5; i++) {
		position1 = createVector(random(width),random(height))
    wolves[i] = new Creature(position1, worldDNA[0]);
  }

  for (var i = 0; i < 15; i++) {
		position2 = createVector(random(width),random(height))
    rabbits[i] = new Creature(position2, worldDNA[1]);
  }

  for (var i = 0; i < 25; i++) {
		position3 = createVector(random(width),random(height))
    grass[i] = new Creature(position3, worldDNA[2]);
  }
}

// Draw creature species (run creature functions)
function draw() {
  background('#dee8df');
  // Start population
  for (var i = 0; i < rabbits.length; i++) {
    // move
    rabbits[i].run(rabbits);
    // eat
    rabbits[i].eat(grass);
    //rabbits[i].flock(grass, 3.0); // CHASE THE GRASS!
    // run away from wolves
    rabbits[i].flee(wolves, 50, 2.5);  // RUN AWAY!
    // reproduce
		var partner = floor(random(0, rabbits.length-1))
    potentialChild = rabbits[i].reproduce(rabbits[partner]);
    if (potentialChild != null){
        rabbits.push(potentialChild);
    }
    // kill
    if (rabbits[i].creatureSize < 0) {
        rabbits.splice(i,1)
    }
  }

  for (var i = 0; i < wolves.length; i++) {
    wolves[i].run(wolves);
    wolves[i].eat(rabbits);
    wolves[i].flock(rabbits, 2.0); // CHASE THE RABBITS!
		var partner = floor(random(0, wolves.length-1));
    potentialChild = wolves[i].reproduce(wolves[partner]);
    if (potentialChild != null){
        wolves.push(potentialChild);
    }
    // kill
    if (wolves[i].creatureSize < 0) {
        wolves.splice(i,1)
    }
  }

  for (var i = 0; i < grass.length; i++) {
    grass[i].render(grass);
		var partner = floor(random(0, grass.length-1));
    potentialChild = grass[i].reproduce(grass[partner]);
    if (potentialChild != null){
        grass.push(potentialChild);
    }
  }

	newWorld();
	//display to HTML page
	document.getElementById("wolfPop").innerHTML = wolves.length;
	document.getElementById("rabbitPop").innerHTML = rabbits.length;
	document.getElementById("grassPop").innerHTML = grass.length;
}
