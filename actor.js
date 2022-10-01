
//freeman.celine
var Actor = function Actor() {
  EventEmitter.call(this);
  Object.defineProperty(this, 'private', {
    value: {
      radius: -1
    },
    enumerable: false 
  });
  Object.defineProperty(this, 'radius', {
    get:()=>{
      if (this.private.radius < 0) {
        var byLength=[...this.vertex].sort((a,b)=>v.size(b)-v.size(a));
        this.private.radius = v.size(byLength[0]);
      } 
      return this.private.radius;
    } 
  })

}
Actor.prototype = new EventEmitter();
Actor.prototype.constructor = Actor.constructor;
Actor.prototype.parent = null;
Actor.prototype.disposed = false;
Actor.prototype.pos = [0,0];
Actor.prototype.angle = 0;
Actor.prototype.color = "green";
Actor.prototype.detectCollisions = false;
Actor.prototype.onCollision = function(actor) {
  
}
Actor.prototype.vertex = [];
Actor.prototype.lines = [];
Actor.prototype.velocity = [0,0];
Actor.prototype.dispose = function() {
  this.disposed = true;
}
Actor.prototype.update = function(t) {
  var deltaPos = v.scale(t,this.velocity);
  this.pos = v.add(this.pos, deltaPos);

  this.compute();
  if(this.detectCollisions) {
      this.parent.actors.filter(actor=>actor.detectCollisions).forEach(actor=>{
        if(this.isCollision(actor)) {
          this.onCollision(actor);
          
        }
      })
    }
};
Actor.prototype.compute = function() {
  var rotation=matrix2d.rotate(this.angle);
  var translation=matrix2d.translate(this.pos);
  var transposition=matrix2d.product(rotation,translation);
  var projection=matrix2d.product(transposition,this.parent.screen.projectionMatrix);
  var vertices = this.vertex.map(vertex=>matrix2d.multiplicate(projection,vertex));
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
Actor.prototype.isCollision = function(b) {
  var distance = v.size(v.subtract(this.pos,b.pos));
  if(distance <= this.radius + b.radius) {
    if(!this.projection) {
      this.compute();
    }
    if(!b.projection) {
      b.compute();
    }
    return this.projection.some(vertex=>isPointInPoly(b.lines[0].map(i=>b.projection[i]),vertex));
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
    //ship.radius = v.create(ship.vertex[0]).size;
    this.acceleration=100;
    this.friction=10;
    this.velocity = [0,0];
    this.maxvelocity = 600;

  }
  fire() {
    var misslePos = [30,0];
    var rotation = matrix2d.rotate(this.angle);
    misslePos = v.add(this.pos, matrix2d.multiplicate(rotation,misslePos));
    game.add(new Missle(misslePos, this.angle));
  }
  update(t) {
    this.angle=this.parent.mouse.angle;
    //friction
    var deltaV = v.scale(-1*t/this.friction,this.velocity);
    this.velocity = v.add(this.velocity, deltaV)
    //accelerate
    if(this.parent.controls.up) {
      var a = [Math.cos(this.angle)*this.acceleration,Math.sin(this.angle)*this.acceleration];
      var deltaV=v.scale(t,a);
      this.velocity = v.add(this.velocity,deltaV);
    }
    super.update(t);
    
  }
}
var Missle = class extends Actor {
  constructor(pos,angle) {
    super();
    this.pos=pos;
    this.angle=angle;
    this.color="yellow";
    this.lifetime=2;
    this.detectCollisions=true;
    var velocity = 200;
    this.vertex = [[-2,0],[2,0]];
    this.lines = [[0,1]];
    this.velocity = [Math.cos(this.angle)*velocity, Math.sin(this.angle)*velocity];

  }
  onCollision(actor){
    actor.onCollision(this);
    this.dispose();
  }
  update(t){
    this.lifetime -= t;
    if (this.lifetime < 0) {
      this.dispose();
    }
    
    super.update(t);
    /*
    this.parent.actors.filter(actor=>actor.detectCollisions).forEach(actor=>{
      if(this.isCollision(actor)) {
        //on collision explode and hit target.
        actor.onCollision(this);
        //actor.detectCollisions=false;
        this.dispose();
      }
    })
    */
  }
}
