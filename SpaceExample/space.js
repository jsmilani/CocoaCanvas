CCCache.loadImage('sun', 'Sun.png');
CCCache.loadImage('planet1', 'Earth.png');
CCCache.loadImage('planet2', 'Mars.png');
CCCache.loadImage('planet3', 'Planet3.png');

function SpaceGame(canvasName) {
  CCApplication.call(this, canvasName);
  
  this.window.addSubview(new Galaxy(this.window.frame));
}
CCSubclass(SpaceGame, CCApplication);

function Star(x,y,size) {
  this.x = x;
  this.y = y;
  this.size = size;
}

function Galaxy(frame) {
  CCView.call(this, frame);
  
  this.stars = [];
  for(var i = 0; i < 30; i++) {
    this.stars.push(this.randomStar());
  }
  
  var rect = CCRectMake(0, 0, 480, 480);
  this.solarSystem = new SolarSystem(rect, 'sun');
  this.solarSystem.delegate = this;
  this.addSubview(this.solarSystem);
  
  rect = CCRectMake(480, 0, 160, 480);
  this.infoBar = new InfoBar(rect);
  this.addSubview(this.infoBar);
}
CCSubclass(Galaxy, CCView);
Galaxy.prototype.randomStar = function() {
  return new Star(Math.floor(Math.random() * (480 - 10) + 4), Math.floor(Math.random() * (480 - 10) + 4) , Math.floor(Math.random() * 2 + 1));
}
Galaxy.prototype.drawRect = function(rect) {
  var ctx = this.context();
  
  var inset = 0.5;
  var radius = 4;
  
  ctx.fillStyle = "#000000";
  ctx.fillRect(this.frame.origin.x, this.frame.origin.y ,this.frame.size.w, this.frame.size.h);
  
  ctx.fillStyle = "#FFFFFF";
  // stars
  for(var i in this.stars) {
    ctx.fillRect(this.stars[i].x, this.stars[i].y, this.stars[i].size, this.stars[i].size);
  }
}
Galaxy.prototype.setSelectedPlanet = function(planet) {
  this.infoBar.setSelectedPlanet(planet);
}

function SolarSystem(frame, sunName) {
  CCView.call(this, frame);
  this.image = CCImage(sunName);
  this.delegate = null;
  
  this.addPlanet(100, 12, {name:'Earth', imageName:'planet1', radius:'6,371.0 km', mass:'5.9736x10^24 kg', surfacePressure:'101.325 kPa'});
  this.addPlanet(160, 10, {name:'Mars', imageName:'planet2', radius:'3,396.2 km', mass:'6.4185x10^23 kg', surfacePressure:'0.636 kPa'});
  this.addPlanet(220, 5, {name:'Uranus', imageName:'planet3', radius:'25,559 km', mass:'8.6810x10^25 kg', surfacePressure:'n/a'});
  
  var self = this;
  //setTimeout(function(){self.updateOrbits()},10000);
  setInterval(function(){self.updateOrbits()},50);
}
CCSubclass(SolarSystem, CCView);
SolarSystem.prototype.addPlanet = function(orbit, speed, data) {
  var planet = new Planet(this.frame.size.w / 2, this.frame.size.h / 2, orbit, speed, data);
  this.addSubview(planet);
  return planet;
}
SolarSystem.prototype.drawRect = function(rect) {
  var ctx = this.context();
  ctx.drawImage(this.image, (this.frame.size.w - this.image.width) / 2, (this.frame.size.h - this.image.height) / 2);
}
SolarSystem.prototype.doClick = function(e) {
  var self = this;
  var localPoint = this.convertPointFromWindow(new CCPoint(e.offsetX, e.offsetY));
  var subview = this.subviewWithPoint(localPoint);
  
  for(var i in this.subviews) {
    this.subviews[i].setSelected(false);
  }
  
  if(subview && subview.isMemberOfClass(Planet)) {
    subview.setSelected(true);
    if(this.delegate) {
      this.delegate.setSelectedPlanet(subview);
    }
  } else {
    if(this.delegate) {
      this.delegate.setSelectedPlanet(null);
    }
  }
  
}
SolarSystem.prototype.updateOrbits = function(e) {
  for(var i in this.subviews) {
    this.subviews[i].stepForward();
  }
}

function Planet(x, y, orbit, speed, data) {
  this.data = data
  this.image = CCImage(data.imageName);
  this.selected = false;
  this.origin = new CCPoint(x, y);
  this.orbit = orbit;
  this.speed = speed;
  this.step = Math.floor(Math.random()*360);
  this.frame = CCRectMake(0, 0, this.image.width + 2, this.image.height + 2);
  CCView.call(this, this.frameForStep());
}
CCSubclass(Planet, CCView);
Planet.prototype.setSelected = function(newValue) {
  this.selected = newValue;
  this.setNeedsDisplay();
}
Planet.prototype.drawRect = function(rect) {
  var ctx = this.context();
  
  ctx.drawImage(this.image, 1, 1);
  
  if(this.selected) {
    var inset = 1;
    var radius = this.image.height / 2; // assume square
    
    ctx.beginPath();
    ctx.moveTo(inset + radius, inset);
    ctx.arcTo(this.frame.size.w - inset, inset, this.frame.size.w - inset, inset + radius, radius);
    ctx.arcTo(this.frame.size.w - inset, this.frame.size.h - inset, this.frame.size.w - inset - radius, this.frame.size.h - inset, radius);
    ctx.arcTo(inset, this.frame.size.h - inset, inset, this.frame.size.h - inset - radius, radius);
    ctx.arcTo(inset, inset, inset + radius, inset, radius);
    ctx.closePath();
    ctx.strokeStyle = "#77B4FC";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
Planet.prototype.frameForStep = function() {
  var rect = CCRectMake(Math.round(this.origin.x + this.orbit * Math.sin(this.step / 360) - (this.frame.size.w / 2)), Math.round(this.origin.y + this.orbit * 0.7 * Math.cos(this.step / 360) - (this.frame.size.h / 2)), this.frame.size.w, this.frame.size.h);
  return rect;
}
Planet.prototype.stepForward = function() {
  this.step = this.step + this.speed;
  this.setFrame(this.frameForStep());
}

function InfoBar(frame) {
  CCView.call(this, frame);
  this.selectedPlanet = null;
  this.count = 0;
}
CCSubclass(InfoBar, CCView);
InfoBar.prototype.setSelectedPlanet = function(planet) {
  this.selectedPlanet = planet;
  this.setNeedsDisplay();
}
InfoBar.prototype.drawRect = function(rect) {
  var ctx = this.context();
  this.count += 1;
  
  ctx.fillStyle = "#999999";
  ctx.fillRect(0, 0, this.bounds.size.w, this.bounds.size.h);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#666666";
  var inset = CCRectInset(this.bounds, 1, 1);
  ctx.strokeRect(inset.origin.x, inset.origin.y, inset.size.w, inset.size.h);
  
  if(this.selectedPlanet) {
    ctx.textBaseline = 'top';
    ctx.font = "18px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(this.selectedPlanet.data.name, 10, 10);
    
    ctx.font = "10px Arial";
    ctx.fillText("Mass: "+this.selectedPlanet.data.mass, 10, 40);
    ctx.fillText("Radius: "+this.selectedPlanet.data.radius, 10, 55);
    ctx.fillText("Surface Pressure: "+this.selectedPlanet.data.surfacePressure, 10, 70);
  } else {
    ctx.textBaseline = 'top';
    ctx.font = "18px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Planet Info", 10, 10);
    
    ctx.font = "10px Arial";
    ctx.fillStyle = "#CCCCCC";
    ctx.fillText("No planet selected", 40, 50);
    
  }
}