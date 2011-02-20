function subclass(p) {
  function f(){}
  f.prototype = p;
  return new f();
}

function CCPoint(x,y) {
  this.x = x;
  this.y = y;
}
CCPoint.prototype.toString = function() {'x:'+this.x+',y:'+this.y}
function CCSize(w,h) {
  this.w = w;
  this.h = h;
}
CCSize.prototype.toString = function() {'w:'+this.w+',h:'+this.h}
function CCRect(origin,size) {
  this.origin = origin
  this.size = size
}
CCRect.prototype.toString = function() {this.origin.toString()+','+this.size.toString()}
function CMakeRect(x,y,w,h) {
  return new CCRect(new CCPoint(x,y), new CCSize(w,h));
}
function CCRectIntersectsRect(rectA,rectB) {
  return (rectA.origin.x < rectB.origin.x + rectB.size.w && rectB.origin.x < rectA.origin.x + rectA.size.w && rectA.origin.y < rectB.origin.y + rectB.size.h && rectB.origin.y < rectA.origin.y + rectA.size.h)
}
function CCRectUnion(rectA,rectB) {
  var leftRect = rectA.origin.x < rectB.origin.x ? rectA : rectB;
  var topRect = rectA.origin.y < rectB.origin.y ? rectA : rectB;
  var rightRect = rectA.origin.x + rectA.size.w > rectB.origin.x + rectB.size.w ? rectA : rectB;
  var bottomRect = rectA.origin.y + rectA.size.h > rectB.origin.y + rectB.size.h ? rectA : rectB;
  return CMakeRect(leftRect.origin.x, topRect.origin.y, rightRect.origin.x + rightRect.size.w - leftRect.origin.x, bottomRect.origin.y + bottomRect.size.h - topRect.origin.y);
}
function CCRectIntersection(rectA,rectB){
  var notLeftRect = rectA.origin.x < rectB.origin.x ? rectB : rectA;
  var notTopRect = rectA.origin.y < rectB.origin.y ? rectB : rectA;
  var notRightRect = rectA.origin.x + rectA.size.w > rectB.origin.x + rectB.size.w ? rectB : rectA;
  var notBottomRect = rectA.origin.y + rectA.size.h > rectB.origin.y + rectB.size.h ? rectB : rectA;
  return CMakeRect(notLeftRect.origin.x, notTopRect.origin.y, notRightRect.origin.x + notRightRect.size.w - notLeftRect.origin.x, notBottomRect.origin.y + notBottomRect.size.h - notTopRect.origin.y);
}
CCApplication.cache = {imageNames:[], images:{}, loadImage:function(imageName, imagePath) {this.images[imageName] = imagePath; this.imageNames.push(imageName)}}

function CCApplication(canvasName) {
  this.canvas = document.getElementById(canvasName);
  this.ctx = this.canvas.getContext('2d');
  
  this.window = new CCWindow(CMakeRect(0,0,this.canvas.width,this.canvas.height));
  this.window.superview = this;
  
  this.desiredFrameRate = 30;
  this.frameRate = 30;
  this.frameCount = 0;
  this.lastFrameSample = 0;
  
  this.dragging = false;
  this.dragData = null;
  this.doDragCallback = null;
  this.endDragCallback = null;
  this.loadingPercentComplete = 0;
  this.invalidRect = this.window.frame;
  
  var self = this;
  
  // begin loading images
  
  this.animationTimer = setInterval(function(){
    var ctx = self.ctx;
    var width = 200;
    var height = 18;
    var position = new CCPoint((self.canvas.width - width) / 2, self.canvas.height / 2);
    
    ctx.save();
    ctx.translate(position.x,position.y);
    ctx.clearRect(0,0,width,height);
    
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    ctx.strokeRect(0.5, 0.5, height, width);
    ctx.fillRect(0.5, 0.5, (width - 1) * self.loadingPercentComplete / 100, height-1);
    
    ctx.globalCompositeOperation = 'xor';
    ctx.fillText(this.value, (self.canvas.width - width) / 2, 4);
    ctx.restore();
  },200);
  
  var count = CCApplication.cache.imageNames.length;
  var images = [];
  for(var i in CCApplication.cache.imageNames) {
    var image = new Image();
    image.src = CCApplication.cache.images[CCApplication.cache.imageNames[i]];
    images << image;
  }
  
  while(images.length > 0) {
    var incompleteImages = [];
    for(var i in images) {
      if(images[i].complete) {
        this.loadingPercentComplete += 100 / count;
      } else {
        incompleteImages << images[i];
      }
    }
    images = incompleteImages;
  }
  
  this.loadingPercentComplete = 100;
  
  clearInterval(this.animationTimer);
  
  // Done loading. Begin animating...
  
  this.animationTimer = setInterval(function(){self.drawWindow()},1000 / this.desiredFrameRate);
  setInterval(function(){self.calculateFrameRate()},1000);
  
  this.canvas.addEventListener("click", function(e){self.doClick(e);}, true);
  this.canvas.addEventListener("mousedown", function(e){self.doMouseDown(e);}, true);
  this.canvas.addEventListener("mouseup", function(e){self.doMouseUp(e);}, true);
  this.canvas.addEventListener("mousemove", function(e){self.doMouseMove(e);}, true);
}
CCApplication.prototype.drawWindow = function() {
  if(this.invalidRect) {
    this.ctx.clearRect(this.invalidRect.origin.x, this.invalidRect.origin.y, this.invalidRect.size.w, this.invalidRect.size.h);
    this.window._drawRect(this.invalidRect);
    this.invalidRect = null;
  }
  this.frameCount += 1;
}
CCApplication.prototype.calculateFrameRate = function() {
  this.frameRate = this.frameCount - this.lastFrameSample;
  this.lastFrameSample = this.frameCount;
}
CCApplication.prototype.setFrameRate = function(newRate) {
  var self = this;
  this.desiredFrameRate = newRate;
  stopInterval(this.animationTimer);
  this.animationTimer = setInterval(function(){self.drawWindow()}, 1000 / this.desiredFrameRate);
}
CCApplication.prototype.context = function() {
  return this.ctx;
}
CCApplication.prototype.doClick = function(e) {
  e.preventDefault();
  e.stopPropagation();
  this.window.doClick(e);
}
CCApplication.prototype.doMouseDown = function(e) {
  e.preventDefault();
  this.window.doMouseDown(e);
}
CCApplication.prototype.doMouseUp = function(e) {
  e.preventDefault();
  if(this.dragging && this.doEndDragCallback) {
    // done dragging
    this.doEndDragCallback(e, this.dragData);
    var self = this;
    // watch global mouse up so we can detect it outside the canvas
    document.removeEventListener("mouseup", function(e){self.doMouseUp(e);}, true);
    this.canvas.addEventListener("mouseup", function(e){self.doMouseUp(e);}, true);
  } else {
    this.window.doMouseUp(e);
  }
  this.doDragCallback = null;
  this.doEndDragCallback = null;
  this.dragging = false;
  this.dragData = null;
}
CCApplication.prototype.doMouseMove = function(e) {
  e.preventDefault();
  e.stopPropagation();
  
  if(this.dragging && this.doDragCallback) {
    this.doDragCallback(e, this.dragData);
  } else if(this.window) {
    this.window.doMouseMove(e);
  }
}
CCApplication.prototype.beginDrag = function(doDragCallback, doEndDragCallback, dragData) {
  var self = this;
  // watch global mouse up so we can detect it outside the canvas
  this.canvas.removeEventListener("mouseup", function(e){self.doMouseUp(e);}, true);
  document.addEventListener("mouseup", function(e){self.doMouseUp(e);}, true);
  
  this.dragData = dragData;
  this.doDragCallback = doDragCallback;
  this.doEndDragCallback = doEndDragCallback;
  this.dragging = true;
}
CCApplication.prototype.convertPointFromWindow = function(point) {
  return new CCPoint(point.x, point.y);
}
CCApplication.prototype._invalidateRect = function(rect) {
  if(this.invalidRect) {
    this.invalidRect = CCRectUnion(this.invalidRect, rect);
  } else {
    this.invalidRect = rect;
  }
}

function CCView(frame) {
  this.frame = frame;
  this.subviews = [];
  this.superview = null;
}
CCView.prototype.context = function() {
  if(this.superview) {
    return this.superview.context();
  } else {
    return null;
  }
}
CCView.prototype._drawRect = function(rect) {
  var ctx = this.context();
  var localRect = this.convertRectFromSuper(rect);
  
  ctx.save();
  ctx.translate(this.frame.origin.x, this.frame.origin.y);
  
  ctx.beginPath();
  ctx.rect(localRect.origin.x, localRect.origin.y, localRect.size.w, localRect.size.h);
  ctx.closePath();
  ctx.clip();
  this.drawRect(localRect);
  
  for (i in this.subviews) {
    if(this.subviews[i].containsRect(localRect)) {
      this.subviews[i]._drawRect(CCRectUnion(this.subviews[i].frame, localRect));
    }
  }
  
  ctx.restore();
}
CCView.prototype.drawRect = function(rect) {
  // overload this to do drawing
}
CCView.prototype.doClick = function(e) {
  var view = this.subviewWithPoint(new CCPoint(e.offsetX,e.offsetY));
  if(view != null && view != this) {
    view.doClick(e);
  }
}
CCView.prototype.doMouseDown = function(e) {
  this.lastEvent = e;
  var view = this.subviewWithPoint(new CCPoint(e.offsetX,e.offsetY));
  if(view && view != this) {
    view.doMouseDown(e);
  }
}
CCView.prototype.doMouseUp = function(e) {
  var view = this.subviewWithPoint(new CCPoint(e.offsetX,e.offsetY));
  if(view != null && view != this) {
    view.doMouseUp(e);
  }
}
CCView.prototype.doMouseMove = function(e) {
  var view = this.subviewWithPoint(new CCPoint(e.offsetX,e.offsetY));
  if(view != null && view != this) {
    view.doMouseMove(e);
  }
}
CCView.prototype.beginDrag = function(doDragCallback,doEndDragCallback, dragData) {
  if(this.superview){
    this.superview.beginDrag(doDragCallback, doEndDragCallback, dragData);
  }
}
CCView.prototype.subviewWithPoint = function(point) {
  for (i in this.subviews) {
    // test in reverse because last item is on top
    var view = this.subviews[this.subviews.length - i - 1];
    if(view.containsPoint(point)) {
      return view;
    }
  }
  // this is a match if no subview matches
  return this;
}
CCView.prototype.position = function() {
  if ( this.superview.subviews.indexOf ) {
    return this.superview.subviews.indexOf(this);
  }
  for (i in this.superview.subviews) {
    if ( this.superview.subviews[i] === this) {
      return i;
    }
  }
}
CCView.prototype.sendToBack = function(){
  var position = this.position();
  this.superview.subviews.splice(position,1);
  this.superview.subviews.shift(this);
}
CCView.prototype.bringToFront = function(){
  var position = this.position();
  this.superview.subviews.splice(position,1);
  this.superview.subviews.push(this);
}
CCView.prototype.containsPoint = function(point) {
  // point in frame. no conversion to local
  return (point.x >= this.frame.origin.x && point.x < (this.frame.origin.x + this.frame.size.w) && point.y >= this.frame.origin.y && point.y < (this.frame.origin.y + this.frame.size.h));
}
CCView.prototype.convertPointFromWindow = function(point) {
  return this.superview.convertPointFromWindow(new CCPoint(point.x - this.frame.origin.x, point.y - this.frame.origin.y));
}
CCView.prototype.convertPointFromSuper = function(point) {
  return new CCPoint(point.x - this.frame.origin.x, point.y - this.frame.origin.y);
}
CCView.prototype.containsRect = function(rect) {
  // rect intersects frame. no conversion to local
  return CCRectIntersectsRect(this.frame, rect);
}
CCView.prototype.convertRectFromSuper = function(rect) {
  return CMakeRect(rect.origin.x - this.frame.origin.x, rect.origin.y - this.frame.origin.y, rect.size.w, rect.size.h);
}
CCView.prototype.addSubview = function(view) {
  this.subviews.push(view);
  view.superview = this;
  this._invalidateRect(view.frame);
}
CCView.prototype.removeFromSuperview = function() {
  var position = this.position
  this.superview.subviews.splice(position,1);
  this.superview._invalidateRect(this.frame);
  this.superview = null;
}
CCView.prototype._invalidateRect = function(rect) {
  // this could get called before added to a superview
  if(this.superview) {
    this.superview._invalidateRect(CMakeRect(rect.origin.x + this.frame.origin.x, rect.origin.y + this.frame.origin.y, rect.size.w, rect.size.h));
  }
}
CCView.prototype.setFrame = function(frame) {
  this.superview._invalidateRect(this.frame);
  this.frame = frame;
  this.superview._invalidateRect(this.frame);
}
CCView.prototype.setNeedsDisplay = function() {
  this.cachedContent = null;
  this.superview._invalidateRect(this.frame);
}

function CCImage(imageName) {
  var imagePath = CCApplication.cache.images[imageName];
  var image = new Image();
  image.src = imagePath;
  return image;
}

function CCWindow(frame) {
  CCView.call(this, frame);
}
CCWindow.prototype = subclass(CCView.prototype);
