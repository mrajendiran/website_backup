// Creature class
// Methods for Separation, Cohesion, Alignment added
function Creature(x, y, hexColor, size, maxSpeed) {
  this.acceleration = createVector(0, 0);
  this.velocity = p5.Vector.random2D();
  this.position = createVector(x, y);
  this.radius = 3.0;
  this.maxspeed = maxSpeed;    // Maximum speed
  this.maxforce = 0.05;  // Maximum steering force

  this.run = function(creatures) {
    this.flock(creatures);  // accumulate new acceleration
    this.update();          // update location
    this.borders();
    this.render();
  },

  this.render = function() {
    fill(color(hexColor));
    stroke(200);
    ellipse(this.position.x, this.position.y, size, size);
  },

  // Forces go into acceleration
  this.applyForce = function(force) {
    this.acceleration.add(force);
  },

  // We accumulate a new acceleration each time based on three rules
  this.flock = function(creatures) {
    var sep = this.separate(creatures); // Separation
    var ali = this.align(creatures);    // Alignment
    var coh = this.cohesion(creatures); // Cohesion
    // Arbitrarily weight these forces
    sep.mult(2.5);
    ali.mult(1.0);
    coh.mult(1.0);
    // Add the force vectors to acceleration
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
  },

  // Method to update location
  this.update = function() {
    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset acceleration to 0 each cycle
    this.acceleration.mult(0);
  },

  // A method that calculates and applies a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  this.seek = function(target) {
    // A vector pointing from the location to the target
    var desired = p5.Vector.sub(target, this.position);
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);
    // Steering = Desired minus Velocity
    var steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Limit to maximum steering force
    return steer;
  },

  // Separation
  // Method checks for nearby creatures and steers away
  this.separate = function(creatures) {
    var desiredseparation = 25.0;
    var steer = createVector(0, 0);
    var count = 0;
    // For every creature in the system, check if it's too close
    for (var i = 0; i < creatures.length; i++) {
      var d = p5.Vector.dist(this.position, creatures[i].position);
      // If the distance is greater than 0 and less than an
      // arbitrary amount (0 when you are yourself)
      if ((d > 0) && (d < desiredseparation)) {
        // Calculate vector pointing away from neighbor
        var diff = p5.Vector.sub(this.position, creatures[i].position);
        diff.normalize();
        diff.div(d); // Weight by distance
        steer.add(diff);
        count++; // Keep track of how many
      }
    }
    // Average -- divide by how many
    if (count > 0) {
      steer.div(count);
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(this.maxspeed);
      steer.sub(this.velocity);
      steer.limit(this.maxforce);
    }
    return steer;
  },

  // Alignment
  // For every nearby creature in the system,
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

  // Cohesion
  // For the average location (i.e. center) of all nearby creatures,
  // calculate steering vector towards that location
  this.cohesion = function(creatures) {
    var neighbordist = 50;
    var sum = createVector(0, 0); // Start with empty vector to accumulate all locations
    var count = 0;
    for (var i = 0; i < creatures.length; i++) {
      var d = p5.Vector.dist(this.position, creatures[i].position);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(creatures[i].position); // Add location
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum); // Steer towards the location
    } else {
      return createVector(0, 0);
    }
  },

    // Prevent from leaving canvas
  this.borders = function() {
    if (this.position.x < this.radius) this.velocity.x = 1;
    if (this.position.y < this.radius) this.velocity.y = 1;
    if (this.position.x > width - this.radius) this.velocity.x = -1;
    if (this.position.y > height - this.radius) this.velocity.y = -1;
    }
}
