//var {inspect}=require('util');
var module = module || { exports: this };
var exports = exports || module.exports

var deg = exports.deg = x => x/(2*Math.PI/360);
var rad = exports.rad = phi => phi*(2*Math.PI/360);

var map360=exports.map360=x=>x<0?360+x:x;
var map2PI=exports.map2PI=x=>x<0?2*Math.PI+x:x;

var angle=(u,v)=>Math.acos(Vector.dot(u,v)/u.size*v.size)


class Vector extends Array {

  constructor(array) {
    if(!Array.isArray(array) && typeof(array)=='number')
      array = new Array(array).fill(0);
    if(array.length<1) {
      throw new TypeError('expected contructor parameter must contain at least one element');
    }
    super(array.length);
    Object.assign(this, array);
  }

  get x() {
    return this[0];
  }
  set x(a) {
    this[0] = a;
    return a;
  }
  get y() {
    return this[1];
  }
  set y(a) {
    this[1] = a;
    return a;
  }
  get z() {
    return this[2];
  }
  set z(a) {
    this[2] = a;
    return a;
  }
  static create(x, ...yz) {
    if(Array.isArray(x)) {
      return new Vector(x);
    } else {
      return new Vector([x||0,...yz]);
    }
  }
  static createNormByAngle(degree) {
    return this.create([Math.cos(rad(degree)),Math.sin(rad(degree))]);
  }

  static scale(k, v1) {
    return Vector.create(v1.map((a,i)=>k*a));
  }

  scale(k) {
    for(var i=0;i<this.length;i++)
      this[i] *= k;
    return this;
  }

  static subtract(...vs) {
    var v3=Vector.create(vs[0]);
    return vs.slice(1).reduce((v1,v2)=>v1.subtract(v2),v3);
  }

  subtract(v1) {
    for(var i=0;i<this.length;i++)
      this[i] -= v1[i];
    return this;
  }

  static add(...vs) {
    var v3=new Vector(vs[0].length);
    return vs.reduce((v1,v2)=>v1.add(v2), v3);
  }

  add(v1) {
    for(var i=0;i<this.length;i++)
      this[i] += v1[i];
    return this;
  }

  static dot(v1, v2) {
    return v1.map((a,i)=>v1[i]*(i in v2?v2[i]:1)).reduce((a,b)=>a+b);
  }

  dot(v2) {
    return Vector.dot(this, v2);
  }

  static size(v1) {
    return Math.sqrt(v1.reduce((sum,a)=>sum+a*a,0));
  }

  get size() {
    return Vector.size(this)
  }

  static norm(v1) {
    var len = v1.size;
    var k = (len === 0) 
      ? 0 
      : 1.0 / len;
    return Vector.scale(k, v1);
  }

  get angle() {
    return map2PI(Math.atan2(this[1],this[0])); 
  }
  static angle(u) {
    return map2PI(Math.atan2(u[1],u[0])); 
  }

  norm() {
    return Vector.norm(this);
  }

  static cross(v1, v2) {
    return Vector.create([
      v1.y * v2.z||0 - v1.z||0 * v2.y,
      v1.z||0 * v2.x - v1.x * v2.z||0,
      v1.x * v2.y - v1.y * v2.x
    ]);
  }

  cross(v2) {
    return Vector.cross(this, v2);
  }

  static wolfram(list) {
    return "http://www.wolframalpha.com/input/?i=" + encodeURI(list.map(v=>"vector+"+v.toString()).join('+')); 
  };

  toString() {
    return super.toString()
  }

  toJSON() {
    return super.toJSON();
  }

  /*
  [inspect.custom]() {
    return super[inspect.custom]();
  }
  */
}

class Matrix {
    constructor(rows,cols) {
        if(Array.isArray(rows)) {
          this.rows=rows.map(row=>Vector.create(row));
        } else {
          this.rows=Array.from({length:rows},(e,i)=>new Vector(cols));
        }
        Object.assign(this,this.rows);
        this.length=this.rows.length;
    }
    [Symbol.iterator]() {
      return this.rows[Symbol.iterator]();
    }
    static rotation3D(roll=0, pitch=0, yaw=0, translate) {

      roll=rad(roll);
      pitch=rad(pitch);
      yaw=rad(yaw);
	
      var {cos, sin} = Math;
    
      var cosa = cos(roll);
      var sina = sin(roll);
      var cosb = cos(yaw);
      var sinb = sin(yaw);
      var cosc = cos(-pitch);
      var sinc = sin(-pitch);
    
      if(translate){
        var [x,y,z]=translate;
        return new Matrix([
          [cosa*cosb, cosa*sinb*sinc - sina*cosc, cosa*sinb*cosc + sina*sinc, x],
          [sina*cosb, sina*sinb*sinc + cosa*cosc, sina*sinb*cosc - cosa*sinc, y],
          [-sinb, cosb*sinc, cosb*cosc, z],
          [0, 0, 0, 1]
        ]);
      } else {
        return new Matrix([
          [cosa*cosb, cosa*sinb*sinc - sina*cosc, cosa*sinb*cosc + sina*sinc],
          [sina*cosb, sina*sinb*sinc + cosa*cosc, sina*sinb*cosc - cosa*sinc],
          [-sinb, cosb*sinc, cosb*cosc]
        ]);
      }
      
    }
    static rotation2D(angle,translate) {

      if(typeof(v1)=='object') {
        var [cos, sin] = Vector.create(angle).norm();
      } else {
        var sin=Math.sin(angle);
        var cos=Math.cos(angle);
      }
      /*
      var cosP=cos(phi);
      var sinP=sin(phi);
      /* */
      if(translate) {
        
        var [x,y]=translate;

        return new Matrix([
          [cos, -sin, x],
          [sin, cos,  y],
          [0, 0, 1]
        ]);

      } else {
        return new Matrix([
          [cos, -sin],
          [sin, cos]
        ]);  
      }
      
    }
    
    get cols(){
      var cols_=Array.from({length:this.rows[0].length},(e,i)=>i);
      return cols_.map(i=>this.rows.map(row=>row[i]));

    }
    static product(A,B) {
      var len=A.rows.length;
      var C=[...Array(len)].map((e,i)=>[...Array(len)]);
      for(var i=0;i<len;i++)
        for(var j=0;j<len;j++)
          C[i][j]=Vector.dot(A.rows[i],B.cols[j]);

      return new Matrix(C);
    }
    multiplicate(v1) {
      var vlength=v1.length;
      /*
      if(this.rows.length>v1.length) {
        var v2=Vector.create(v1);
        for(var i=v1.length;i<=this.rows.length; i++) {
          v[i]=1;
        }
      }
      */
      return Vector.create(this.rows.map(row=>Vector.dot(row,v1)).slice(0,vlength));
    }
}

exports.Vector = Vector;
exports.Matrix = Matrix;
var v = exports.v = function(){ return Vector.create.apply(Vector, arguments); }