CCCache.loadImage('hearts', 'heart.png');
CCCache.loadImage('diamonds', 'diamond.png');
CCCache.loadImage('clubs', 'club.png');
CCCache.loadImage('spades', 'spade.png');

function CardGame(canvasName) {
  CCApplication.call(this, canvasName);
  
  this.window.addSubview(new Table(this.window.frame));
}
CCSubclass(CardGame, CCApplication);

function Table(frame) {
  CCView.call(this, frame);
  
  this.cardValues = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  this.suits = ['hearts','clubs','diamonds','spades'];
  
  var cx = 10;
  var cy = 10;
  for(suitIndex in this.suits) {
    for(valueIndex in this.cardValues) {
      this.addSubview(new Card(new CCPoint(cx,cy),this.suits[suitIndex],this.cardValues[valueIndex]));
      cx += 10;
      cy += 10;
    }
    cy = 10;
  }
}
CCSubclass(Table, CCView);
Table.prototype.drawRect = function(rect) {
  var ctx = this.context();
  
  var inset = 0.5;
  var radius = 4;
  ctx.beginPath();
  ctx.moveTo(inset + radius, inset);
  ctx.arcTo(this.frame.size.w - inset, inset, this.frame.size.w - inset, inset + radius, radius);
  ctx.arcTo(this.frame.size.w - inset, this.frame.size.h - inset, this.frame.size.w - inset - radius, this.frame.size.h - inset, radius);
  ctx.arcTo(inset, this.frame.size.h - inset, inset, this.frame.size.h - inset - radius, radius);
  ctx.arcTo(inset, inset, inset + radius, inset, radius);
  ctx.closePath();
  ctx.fillStyle = "#079016";
  ctx.fill();
  ctx.strokeStyle = "#000000";
  ctx.stroke();
}
Table.prototype.doClick = function(e) {
  
}
Table.prototype.doMouseDown = function(e) {
  var self = this;
  var localPoint = this.convertPointFromWindow(new CCPoint(e.offsetX, e.offsetY));
  var card = this.subviewWithPoint(localPoint);
  
  if(card && card.isKindOfClass(Card)) {
    var dragData = {startOrigin:new CCPoint(card.frame.origin.x,card.frame.origin.y), startPosition:localPoint, card:card};
    card.bringToFront();
    this.beginDrag(function(event,data){self.doDrag(event,data);}, function(event,data){self.doEndDrag(event,data);}, dragData);
  }
}
Table.prototype.doEndDrag = function(e, dragData) {
}
Table.prototype.doDrag = function(e, dragData) {
  var localPoint = this.convertPointFromWindow(new CCPoint(e.offsetX,e.offsetY));
  this.moveCardTo(dragData.card, new CCPoint(dragData.startOrigin.x + localPoint.x - dragData.startPosition.x, dragData.startOrigin.y + localPoint.y - dragData.startPosition.y))
}
Table.prototype.moveCardTo = function(card, point) {
  var padding = 2; // technically padding + 1
  if(point.x < padding) {
    point.x = padding;
  } else if(point.x > this.frame.size.w - card.frame.size.w - padding) {
    point.x = this.frame.size.w - card.frame.size.w - padding;
  }
  
  if(point.y < padding) {
    point.y = padding;
  } else if(point.y > this.frame.size.h - card.frame.size.h - padding) {
    point.y = this.frame.size.h - card.frame.size.h - padding;
  }
  
  card.setFrame(new CCRect(point, card.frame.size));
}


function Card(origin, suit, value) {
  var cardSize = new CCSize(60, 80);
  var frame = new CCRect(origin, cardSize);
  CCView.call(this, frame);
  this.suit = suit;
  this.value = value;
  this.imageData = null;
}
CCSubclass(Card, CCView);

Card.prototype.drawRect = function(rect) {
  var ctx = this.context();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = "12px Helvetica";
  
  var color;
  var suitText;
  var valueWidth = ctx.measureText(this.value).width;
  var image = CCImage(this.suit);
  
  if(this.suit == 'hearts') {
    color = "#FF0000";
  } else if(this.suit == 'clubs') {
    color = "#000000";
  } else if(this.suit == 'diamonds') {
    color = "#FF0000";
  } else if(this.suit == 'spades') {
    color = "#000000";
  }
  
  var inset = 0.5;
  var radius = 4;
  ctx.beginPath();
  ctx.moveTo(inset + radius, inset);
  ctx.arcTo(this.frame.size.w - inset, inset, this.frame.size.w - inset, inset + radius, radius);
  ctx.arcTo(this.frame.size.w - inset, this.frame.size.h - inset, this.frame.size.w - inset - radius, this.frame.size.h - inset, radius);
  ctx.arcTo(inset, this.frame.size.h - inset, inset, this.frame.size.h - inset - radius, radius);
  ctx.arcTo(inset, inset, inset + radius, inset, radius);
  ctx.closePath();
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.strokeStyle = "#000000";
  ctx.stroke();
  
  ctx.fillStyle = color;
  ctx.fillText(this.value, 4, 4);
  ctx.fillText(this.value, this.frame.size.w - valueWidth - 4, this.frame.size.h - 16);
  
  ctx.drawImage(image, (this.frame.size.w / 2) - 8, (this.frame.size.h / 2) - 4);
}