module['Actor']=(function({ctx}){
  var Actor = function Actor() {
    $.EventTarget.call(this);
  }
  Actor.prototype = new $.EventTarget();
  Actor.prototype.constructor = Actor.constructor;
  Actor.prototype.pos = Vector.create([0,0]);
  Actor.prototype.angle = 0;
  Actor.prototype.vertex = [];
  Actor.prototype.lines = [];
  Actor.prototype.update = function() {};
  Actor.prototype.compute = function() {
    var rotationMatrix=Matrix.rotation2D(this.angle);
    var rotated=this.vertex.map(vertex=>rotationMatrix.multiplicate(vertex));
    var translated=rotated.map(vertex=>Vector.add(vertex, this.pos));
    return translated;
  };
  Actor.prototype.draw = function() {
    //var transpositionMatrix=Matrix.rotation2D(this.angle, this.pos);
    //var projectionMatrix=Matrix.product(transpositionMatrix, screen.projectionMatrix);

    var vertices = this.compute();
    var projection = vertices.map(vertex=>screen.projectionMatrix.multiplicate(vertex));


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
  }
  /*
  
  */
  return Actor;
})



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