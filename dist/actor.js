
var Actor = function Actor() {
  $.EventTarget.call(this);
}
Actor.prototype = new $.EventTarget();
Actor.prototype.constructor = Actor.constructor;
Actor.prototype.pos = Vector.create([0,0]);
Actor.prototype.angle = 0;
Actor.prototype.color = "green";
Actor.prototype.detectCollisions = false;
Actor.prototype.private = {
  radius: -1
}
Actor.prototype.radius = function() {
  if (this.private.radius < 0) {
    var byLength=[...this.vertex].sort((a,b)=>Vector.size(b)-Vector.size(a));
    this.private.radius = Vector.size(byLength[0]);
  } 
  return this.private.radius;
}

Actor.prototype.vertex = [];
Actor.prototype.lines = [];
Actor.prototype.update = function() {
  this.compute();
};
Actor.prototype.compute = function() {
  var rotation=Matrix.rotate2D(this.angle);
  var translation=Matrix.translate2D(this.pos);
  var transposition=Matrix.product(translation,rotation);
  var projection=Matrix.product(screen.projectionMatrix,transposition);
  var vertices = this.vertex.map(vertex=>projection.multiplicate(vertex));
  this.projection=vertices;
  return vertices;
};
Actor.prototype.draw = function() {

  this.lines.forEach(line => {
    ctx.beginPath();
    
    var [x,y]=this.projection[line[0]];
    ctx.moveTo(x,y);
    line.slice(1).map(i=>this.projection[i]).forEach(([x,y])=>{
      ctx.lineTo(x,y);
    });
    //ctx.closePath();
    ctx.lineWidth = "2";
    ctx.strokeStyle = this.color;
    ctx.stroke();
  })
}
Actor.isCollision = function(a,b) {
  var distance = Vector.size(Vector.subtract(a.pos,b.pos));
  if(distance <= a.radius() + b.radius()) {
    if(!a.projection) {
      a.compute();
    }
    if(!b.projection) {
      b.compute();
    }
    return a.projection.some(vertex=>isPointInPoly(b.lines[0].map(i=>b.projection[i]),vertex));
  } 
  return false;
}
/*
Actor.prototype.draw = function() {
    var transpositionMatrix=Matrix.rotation2D(this.angle, this.pos);
    var projectionMatrix=Matrix.product(transpositionMatrix, screen.projectionMatrix);
    
    //var vertices = this.compute();
    var projection = this.vertex.map(vertex=>projectionMatrix.multiplicate(vertex));
    

    this.lines.forEach(line => {
      ctx.beginPath();
      ctx.lineWidth = "2";
      ctx.strokeStyle = "green";
      var [x,y]=projection[line[0]];
      ctx.moveTo(x,y);
      line.slice(1).map(i=>projection[i]).forEach(([x,y])=>{
        ctx.lineTo(x,y);
      });
      ctx.stroke();
    })
};
/* */