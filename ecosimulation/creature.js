/*
creature.js
contains:
- all functions associated with a creature (e.g. reproduce, eat)
*/

function Creature(position, DNA) {

  // dna chromosomes
  this.dna = DNA;
  this.position = position;
  this.diameter = DNA[1];
  this.creatureSize = DNA[1];
  this.reproThresh = DNA[2];
  this.hunger = DNA[3];
  this.appetite = DNA[4];
  this.visionRadius = DNA[5];
  this.maxspeed = DNA[6];
  this.calories = DNA[7];
  this.startDiet = DNA[7];
  this.color = DNA[9];
  this.acceleration = createVector(0, 0);
  this.velocity = p5.Vector.random2D();
  this.maxforce = 0.05;  // maximum steering force

  this.run = function(creatures) {
    this.flock(creatures);
    this.update();   // update location
    this.borders();
    this.render();
    this.hunger += 1;
    this.creatureSize -= 0.003 * this.appetite;   // fatigue
  },

  this.render = function() {
    fill(color(this.color));
    stroke(200);
    ellipse(this.position.x, this.position.y, this.creatureSize, this.creatureSize);
  },

  // forces go into acceleration
  this.applyForce = function(force) {
    this.acceleration.add(force);
  },

  // accumulate a new acceleration each time based on three rules
  this.flock = function(creatures, cohMult=1.0) {
    var sep = this.separate(creatures); // separation
    var ali = this.align(creatures);    // alignment
    var coh = this.cohesion(creatures); // cohesion
    // arbitrarily weight these forces
    sep.mult(2.5);
    ali.mult(1.0);
    coh.mult(cohMult);
    // add the force vectors to acceleration
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
  },

  // accumulate a new acceleration each time based on three rules
  this.flee = function(creatures, sepDistance=100, sepMult=25) {
    var sep = this.separate(creatures, sepDistance); // Separation
    //var ali = this.align(creatures);    // Alignment
    //var coh = this.cohesion(creatures); // Cohesion
    // Arbitrarily weight these forces
    sep.mult(sepMult);
    //ali.mult(1.0);
    //coh.mult(1.0);
    // Add the force vectors to acceleration
    this.applyForce(sep);
    //this.applyForce(ali);
    //this.applyForce(coh);
  },

  // update location
  this.update = function() {

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // reset acceleration to 0 each cycle
    this.acceleration.mult(0);
  },

  // method that calculates and applies a steering force towards a target
  // steer = desired minus velocity
  this.seek = function(target) {
    // vector pointing from the location to the target
    var desired = p5.Vector.sub(target, this.position);
    // normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);
    // steering = desired minus velocity
    var steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  },

  // separation method checks for nearby creatures and steers away
  this.separate = function(creatures, sepDistance=25.0) {
    var desiredseparation = sepDistance;
    var steer = createVector(0, 0);
    var count = 0;
    // for every creature in the system, check if it's too close
    for (var i = 0; i < creatures.length; i++) {
      var d = p5.Vector.dist(this.position, creatures[i].position);
      // if the distance is greater than 0 and less than an
      // arbitrary amount (0 when you are yourself)
      if ((d > 0) && (d < desiredseparation)) {
        // calculate vector pointing away from neighbor
        var diff = p5.Vector.sub(this.position, creatures[i].position);
        diff.normalize();
        diff.div(d); // weight by distance
        steer.add(diff);
        count++; // keep track of how many
      }
    }
    // average -- divide by how many
    if (count > 0) {
      steer.div(count);
    }

    if (steer.mag() > 0) {
      // implement Reynolds: steering = desired - velocity
      steer.normalize();
      steer.mult(this.maxspeed);
      steer.sub(this.velocity);
      steer.limit(this.maxforce);
    }
    return steer;
  },

  // alignment
  // ror every nearby creature in the system,
  // calculate the average velocity
  this.align = function(creatures) {
    var neighbordist = 50;
    var sum = createVector(0, 0);
    var count = 0;
    for (var i = 0; i < creatures.length; i++) {
      var d = p5.Vector.dist(this.position, creatures[i].position);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(creatures[i].velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxspeed);
      var steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxforce);
      return steer;
    } else {
      return createVector(0, 0);
    }
  },

  // cohesion
  // for the average location (i.e. center) of all nearby creatures,
  // calculate steering vector towards that location
  this.cohesion = function(creatures) {
    var neighbordist = 50;
    var sum = createVector(0, 0); // accumulate all locations
    var count = 0;
    for (var i = 0; i < creatures.length; i++) {
      var d = p5.Vector.dist(this.position, creatures[i].position);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(creatures[i].position); // add location
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum); // steer towards the location
    } else {
      return createVector(0, 0);
    }
  },

  // prevent from leaving canvas
  this.borders = function(canvasWidth) {
    if (this.position.x < this.creatureSize) this.velocity.x = 1;
    if (this.position.y < this.creatureSize) this.velocity.y = 1;
    if (this.position.x > windowWidth - this.creatureSize) this.velocity.x = -1;
    if (this.position.y > windowHeight - this.creatureSize) this.velocity.y = -1;
    },

  this.eat = function(f) {
    var food = f;

    for (var i = food.length-1; i >= 0; i--) {
      var foodLocation = food[i];
      var d = p5.Vector.dist(this.position, foodLocation.position);

      if (d < this.creatureSize/2 & this.hunger > this.appetite) {
        this.creatureSize += 10;
        this.health += 100;
        this.hunger = 0;
        food.splice(i,1);
      }
    }
  },

  this.reproduce = function(bPartner) {

    if (random(1) / (0.025 * this.creatureSize**2) < this.reproThresh ) { // bigger ones should reproduce easier

      // crossover
      var aPartnerDNA = this.dna;
      var bPartnerDNA = bPartner.dna;
      var childDNA = []

      // random sharing of genes
      var position = round(random(1,11))
      for (var i = 0; i < this.dna.length; i++) {
        if (i > position) {
          childDNA[i] = aPartnerDNA[i];
        }
        else {
          childDNA[i] = bPartnerDNA[i];
        }
      }

    function shadeColor2(color, percent) {
      var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
      return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
    }

      // mutation
      var mutationRate = 0.2
      var col = childDNA[9];
      var mutateFactor = round(random(-3,3));
      if (random(1) < mutationRate) {
        childDNA[1] += mutateFactor; // diameter
        childDNA[4] += mutateFactor; // appetite
        childDNA[5] += mutateFactor; // vision radius
        childDNA[6] += mutateFactor; // maxspeed
        childDNA[9] = shadeColor2(col, mutationRate); // color
        //childDNA[9] = col.substr(0,5) + String(Number(col[5]) + 2)[0] + col[6];
        childDNA[10] += mutateFactor; // health
      }

      // parent loses energy (goes to 80% starting size or half current size, whichever is bigger)
      this.creatureSize = Math.max(this.diameter * .8, this.creatureSize / 2);
      // place this child tenderly into the new world
      var newPosition = createVector(this.position.x + (this.creatureSize*random(-1,5)), this.position.y + (this.creatureSize*random(-1,5)))
      return new Creature(newPosition, childDNA);
    }
    else {
      return null;
    }
  }
}
