var creatures = [];
var creatures2 = [];
var creatures3 = [];

function setup() {
  createCanvas(700, 700);

  // Initialize creatures
  for (var i = 0; i < 5; i++) {
    creatures[i] = new Creature(random(width), random(height), "#eaeaea", 20, 1);
  }

  for (var i = 0; i < 5; i++) {
    creatures2[i] = new Creature(random(width), random(height), "#000000", 40, 1);
  }

  for (var i = 0; i < 20; i++) {
    creatures3[i] = new Creature(random(width), random(height), "green", 10, 0);
  }

}

function draw() {
  background('#dee8df');
  // Start population
  for (var i = 0; i < creatures.length; i++) {
    creatures[i].run(creatures);
  }

  for (var i = 0; i < creatures2.length; i++) {
    creatures2[i].run(creatures2);
  }

  for (var i = 0; i < creatures3.length; i++) {
    creatures3[i].run(creatures3);
  }

}
