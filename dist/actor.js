
var Actor = function Actor() {
  $.EventTarget.call(this);
  Object.defineProperty(this, 'private', {
    value: {
      radius: -1
    },
    enumerable: false 
  });
  Object.defineProperty(this, 'radius', {
    get:()=>{
      if (this.private.radius < 0) {
        var byLength=[...this.vertex].sort((a,b)=>Vector.size(b)-Vector.size(a));
        this.private.radius = Vector.size(byLength[0]);
      } 
      return this.private.radius;
    } 
  })

}
Actor.prototype = new $.EventTarget();
Actor.prototype.constructor = Actor.constructor;
Actor.prototype.parent = null;
Actor.prototype.disposed = false;
Actor.prototype.pos = Vector.create([0,0]);
Actor.prototype.angle = 0;
Actor.prototype.color = "green";
Actor.prototype.detectCollisions = false;
Actor.prototype.vertex = [];
Actor.prototype.lines = [];
Actor.prototype.velocity = [0,0];
Actor.prototype.dispose = function() {
  this.disposed = true;
}
Actor.prototype.update = function(t) {
  var deltaPos = Vector.scale(t,this.velocity);
  this.pos = Vector.add(this.pos, deltaPos);

  this.compute();
};
Actor.prototype.compute = function() {
  var rotation=Matrix.rotate2D(this.angle);
  var translation=Matrix.translate2D(this.pos);
  var transposition=Matrix.product(rotation,translation);
  var projection=Matrix.product(transposition,this.parent.screen.projectionMatrix);
  var vertices = this.vertex.map(vertex=>projection.multiplicate(vertex));
  this.projection=vertices;
  return vertices;
};
Actor.prototype.draw = function(ctx) {

  this.lines.forEach(line => {
    ctx.beginPath();
    
    var [x,y]=this.projection[line[0]];
    ctx.moveTo(x,y);
    line.slice(1).map(i=>this.projection[i]).forEach(([x,y])=>{
      ctx.lineTo(x,y);
    });
    ctx.closePath();
    ctx.lineWidth = "2";
    ctx.strokeStyle = this.color;
    ctx.stroke();
  })
}
Actor.isCollision = function(a,b) {
  var distance = Vector.size(Vector.subtract(a.pos,b.pos));
  if(distance <= a.radius + b.radius) {
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


var Ship = class extends Actor {
  constructor(){
    super();
    this.vertex = [
        [ 30, 0 ], 
        [ -15, 21 ], 
        [ -6, 0 ], 
        [ -15, -21 ]
    ], 
    this.lines = [
        [0,1,2,3,0]
    ];
    //ship.radius = Vector.create(ship.vertex[0]).size;
    this.acceleration=60;
    this.friction=6;
    this.velocity = Vector.create([0,0]);
    this.maxvelocity = 400;

  }
  fire() {
    var misslePos = [30,0];
    var rotation = Matrix.rotate2D(this.angle);
    misslePos = Vector.add(this.pos, rotation.multiplicate(misslePos));
    game.add(new Missle(misslePos, this.angle));
  }
  update(t) {
    this.angle=this.parent.mouse.angle;
    //friction
    var deltaV = Vector.scale(-1*t/this.friction,this.velocity);
    this.velocity = Vector.add(this.velocity, deltaV)
    //accelerate
    if(this.parent.controls.up) {
      var a = [Math.cos(this.angle)*this.acceleration,Math.sin(this.angle)*this.acceleration];
      var deltaV=Vector.scale(t,a);
      this.velocity = Vector.add(this.velocity,deltaV);
    }
    super.update(t);
    this.parent.actors.filter(actor=>actor.detectCollisions).forEach(actor=>{
      if(Actor.isCollision(this, actor)) {
        actor.detectCollisions=false;
        actor.color="red";
      }
    })
  }
}
var Missle = class extends Actor {
  constructor(pos,angle) {
    super();
    this.pos=pos;
    this.angle=angle;
    this.color="yellow";
    this.lifetime=2;
    var velocity = 200;
    this.vertex = [[-2,0],[2,0]];
    this.lines = [[0,1]];
    this.velocity = [Math.cos(this.angle)*velocity, Math.sin(this.angle)*velocity];

  }
  update(t){
    this.lifetime -= t;
    if (this.lifetime < 0) {
      this.dispose();
    }
    
    super.update(t);
    this.parent.actors.filter(actor=>actor.detectCollisions).forEach(actor=>{
      if(Actor.isCollision(this, actor)) {
        actor.color="red";
        actor.detectCollisions=false;
      }
    })
  }
}
