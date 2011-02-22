function CCSubclass(sub, sup) {
  function inheritance() {}
  inheritance.prototype = sup.prototype;
  
  sub.prototype = new inheritance();
  sub.prototype.constructor = sub;
  sub.baseConstructor = sup;
  sub.superClass = sup.prototype;
}
function CCObject() {
}
CCObject.prototype.isKindOfClass = function(klass) {
  return (klass == this.getClass());
}
CCObject.prototype.isMemberOfClass = function(klass) {
  return klass.prototype.isPrototypeOf(this);
}
CCObject.prototype.getClass = function() {
  return this.constructor;
}

function CCPoint(x,y) {
  this.x = x;
  this.y = y;
}
function CCPointFromEvent(e) {
  return new CCPoint(e.offsetX, e.offsetY);
}
function CCSize(w,h) {
  this.w = w;
  this.h = h;
}
function CCRect(origin,size) {
  this.origin = origin
  this.size = size
}
CCRect.prototype.components = function() {
  return [this.origin.x, this.origin.y, this.size.w, this.size.h];
}
function CCRectMake(x,y,w,h) {
  return new CCRect(new CCPoint(x,y), new CCSize(w,h));
}
function CCRectInset(rect, dx, dy) {
  return CCRectMake(rect.origin.x + dx, rect.origin.y + dy, rect.size.w - (2 * dx), rect.size.h - (2 * dy));
}
function CCRectIntersectsRect(rectA,rectB) {
  return (rectA.origin.x < rectB.origin.x + rectB.size.w && rectB.origin.x < rectA.origin.x + rectA.size.w && rectA.origin.y < rectB.origin.y + rectB.size.h && rectB.origin.y < rectA.origin.y + rectA.size.h)
}
function CCRectUnion(rectA,rectB) {
  var leftRect = rectA.origin.x < rectB.origin.x ? rectA : rectB;
  var topRect = rectA.origin.y < rectB.origin.y ? rectA : rectB;
  var rightRect = rectA.origin.x + rectA.size.w > rectB.origin.x + rectB.size.w ? rectA : rectB;
  var bottomRect = rectA.origin.y + rectA.size.h > rectB.origin.y + rectB.size.h ? rectA : rectB;
  return CCRectMake(leftRect.origin.x, topRect.origin.y, rightRect.origin.x + rightRect.size.w - leftRect.origin.x, bottomRect.origin.y + bottomRect.size.h - topRect.origin.y);
}
function CCRectIntersection(rectA,rectB){
  var notLeftRect = rectA.origin.x < rectB.origin.x ? rectB : rectA;
  var notTopRect = rectA.origin.y < rectB.origin.y ? rectB : rectA;
  var notRightRect = rectA.origin.x + rectA.size.w > rectB.origin.x + rectB.size.w ? rectB : rectA;
  var notBottomRect = rectA.origin.y + rectA.size.h > rectB.origin.y + rectB.size.h ? rectB : rectA;
  return CCRectMake(notLeftRect.origin.x, notTopRect.origin.y, notRightRect.origin.x + notRightRect.size.w - notLeftRect.origin.x, notBottomRect.origin.y + notBottomRect.size.h - notTopRect.origin.y);
}

function CCResponder() {
  this.nextResponder = null;
}
CCSubclass(CCResponder, CCObject);
CCResponder.prototype.acceptsFirstResponder = function() {return false;}
CCResponder.prototype.becomeFirstResponder = function() {return true;}
CCResponder.prototype.resignFirstResponder = function() {return true;}
CCResponder.prototype.setNextResponder = function(responder) {this.nextResponder = responder;}
CCResponder.prototype.doKeyDown = function(e) {}
CCResponder.prototype.doKeyUp = function(e) {}
CCResponder.prototype.doClick = function(e) {}
CCResponder.prototype.doMouseDown = function(e) {}
CCResponder.prototype.doMouseUp = function(e) {}
CCResponder.prototype.doMouseMove = function(e) {}
CCResponder.prototype.beginDrag = function(doDragCallback,doEndDragCallback, dragData) {}

CCApplication.sharedApplication = null;

function CCApplication(canvasName) {
  CCObject.call(this);
  this.canvas = document.getElementById(canvasName);
  this.ctx = this.canvas.getContext('2d');
  
  this.window = new CCWindow(CCRectMake(0,0,this.canvas.width,this.canvas.height));
  this.window.superview = this;
  
  this.dragging = false;
  this.dragData = null;
  this.doDragCallback = null;
  this.endDragCallback = null;
  this.loadingPercentComplete = 0;
  this.invalidRect = this.window.frame;
  
  CCApplication.sharedApplication = this;
  
  var self = this;
  
  // begin loading images
  
  var animationTimer = setInterval(function(){
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
  
  var count = CCImage.cache.imageNames.length;
  var images = [];
  for(var i in CCImage.cache.names) {
    var image = new Image();
    image.src = CCImage.cache.images[CCCache.cache.imageNames[i]];
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
  
  clearInterval(animationTimer);
  
  // Done loading. Start event listeners.
  
  this.canvas.addEventListener("click", function(e){self.doClick(e);}, true);
  this.canvas.addEventListener("mousedown", function(e){self.doMouseDown(e);}, true);
  this.canvas.addEventListener("mouseup", function(e){self.doMouseUp(e);}, true);
  document.addEventListener("keydown", function(e){self.doKeyDown(e);}, true);
  document.addEventListener("keyup", function(e){self.doKeyUp(e);}, true);
}
CCSubclass(CCApplication, CCResponder);
CCApplication.prototype.drawWindow = function() {
  if(this.invalidRect) {
    this.ctx.clearRect(this.invalidRect.origin.x, this.invalidRect.origin.y, this.invalidRect.size.w, this.invalidRect.size.h);
    this.window._drawRect(this.invalidRect);
    this.invalidRect = null;
  }
}
CCApplication.prototype.context = function() {
  return this.ctx;
}
CCApplication.prototype.convertEvent = function(e) {
  if (!e.offsetX && e.offset != 0) {
    e.offsetX = e.layerX - this.canvas.offsetLeft;
    e.offsetY = e.layerY - this.canvas.offsetTop;
  }
  return e;
}
CCApplication.prototype.doClick = function(e) {
  this.convertEvent(e);
  e.preventDefault();
  e.stopPropagation();
  this.window.doClick(e);
}
CCApplication.prototype.doMouseDown = function(e) {
  this.convertEvent(e);
  e.preventDefault();
  this.window.doMouseDown(e);
}
CCApplication.prototype.doMouseUp = function(e) {
  this.convertEvent(e);
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
  this.convertEvent(e);
  e.preventDefault();
  e.stopPropagation();
  
  if(this.dragging && this.doDragCallback) {
    this.doDragCallback(e, this.dragData);
  } else if(this.window) {
    this.window.doMouseMove(e);
  }
}
CCApplication.prototype.doKeyDown = function(e) {
  this.window.doKeyDown(e);
  e.preventDefault();
}
CCApplication.prototype.doKeyUp = function(e) {
  this.window.doKeyUp(e);
  e.preventDefault();
}
CCApplication.prototype.beginDrag = function(doDragCallback, doEndDragCallback, dragData) {
  var self = this;
  // watch global mouse up so we can detect it outside the canvas
  this.canvas.addEventListener("mousemove", function(e){self.doMouseMove(e);}, true);
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
  this.drawWindow();
}

function CCView(frame) {
  CCObject.call(this);
  this.frame = frame;
  this.bounds = new CCRect(new CCPoint(0, 0), this.frame.size);
  this.subviews = [];
  this.superview = null;
}
CCSubclass(CCView, CCResponder);
CCView.prototype.doClick = function(e) {
  var view = this.hitTest(CCPointFromEvent(e));
  if(view != null && view != this) {
    view.doClick(e);
  }
}
CCView.prototype.doMouseDown = function(e) {
  var view = this.hitTest(CCPointFromEvent(e));
  if(view && view != this) {
    view.doMouseDown(e);
  }
}
CCView.prototype.doMouseUp = function(e) {
  var view = this.hitTest(CCPointFromEvent(e));
  if(view != null && view != this) {
    view.doMouseUp(e);
  }
}
CCView.prototype.doMouseMove = function(e) {
  var view = this.hitTest(CCPointFromEvent(e));
  if(view != null && view != this) {
    view.doMouseMove(e);
  }
}
CCView.prototype.beginDrag = function(doDragCallback,doEndDragCallback, dragData) {
  if(this.superview){
    this.superview.beginDrag(doDragCallback, doEndDragCallback, dragData);
  }
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
      this.subviews[i]._drawRect(CCRectIntersection(this.subviews[i].frame, localRect));
    }
  }
  
  ctx.restore();
}
CCView.prototype.bounds = function() {
  return CCRectMake(0, 0, this.frame.size.w, this.frame.size.h)
}
CCView.prototype.drawRect = function(rect) {
  // overload this to do drawing
}
CCView.prototype.hitTest = function(point) {
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
  return CCRectMake(rect.origin.x - this.frame.origin.x, rect.origin.y - this.frame.origin.y, rect.size.w, rect.size.h);
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
    this.superview._invalidateRect(CCRectMake(rect.origin.x + this.frame.origin.x, rect.origin.y + this.frame.origin.y, rect.size.w, rect.size.h));
  }
}
CCView.prototype.setFrame = function(frame) {
  if(CCRectIntersectsRect(this.frame,frame)) {
    var rect = CCRectUnion(this.frame, frame);
    this.frame = frame;
    this.bounds.size = this.frame.size;
    this.superview._invalidateRect(rect);
  } else {
    var rect = this.frame;
    this.frame = frame;
    this.bounds.size = this.frame.size;
    this.superview._invalidateRect(rect);
    this.superview._invalidateRect(this.frame);
  }
}
CCView.prototype.setNeedsDisplay = function() {
  this.cachedContent = null;
  this.superview._invalidateRect(this.frame);
}

function CCImage(imageName) {
  var imagePath = CCImage.cache.images[imageName];
  var image = new Image();
  image.src = imagePath;
  return image;
}
CCImage.cache = {imageNames:[], images:{}}
CCImage.prepare = function(imageName, imagePath) {
  CCImage.cache.images[imageName] = imagePath;
  CCImage.cache.imageNames.push(imageName);
}

function CCWindow(frame) {
  CCView.call(this, frame);
  this.firstResponder = null;
}
CCSubclass(CCWindow, CCView);
CCWindow.prototype.makeFirstResponder = function(responder) {
  if(responder.acceptsFirstResponder() && responder.becomeFirstResponder()) {
    if(this.firstResponder) {
      this.firstResponder.resignFirstResponder();
    }
    this.firstResponder = responder;
  } else {
    this.firstResponder = null;
  }
}
CCWindow.prototype.doKeyDown = function(e) {
  if(this.firstResponder) {
    this.firstResponder.doKeyDown(e);
  }
  
}
CCWindow.prototype.doKeyUp = function(e) {
  if(this.firstResponder) {
    this.firstResponder.doKeyUp(e);
  }
}


function CCViewController(frame) {
  CCObject.call(this, frame);
}
CCSubclass(CCViewController, CCObject);