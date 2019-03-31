//var {inspect}=require('util');
var module = module || { exports: this };
var exports = exports || module.exports

var deg = exports.deg = x => x/(2*Math.PI/360);
var rad = exports.rad = phi => phi*(2*Math.PI/360);

var map360=exports.map360=x=>x<0?360+x:x;
var map2PI=exports.map2PI=x=>x<0?2*Math.PI+x:x;

var angle=(u,v)=>Math.acos(Vector.dot(u,v)/u.size*v.size)

var isPointInPoly = (poly, pt) => {
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i][1] <= pt[1] && pt[1] < poly[j][1]) || (poly[j][1] <= pt[1] && pt[1] < poly[i][1]))
        && (pt[0] < (poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])
        && (c = !c);
    return c;
}


var forEach = (arr, fn) => {
	for(let i=0;i<arr.length;i++) {
		fn(arr[i],i);
	};
}
var map = (arr, fn) => {
	var xs = Array(arr.length);
	for(let i=0;i<arr.length;i++) {
		xs[i]=fn(arr[i],i);
	};
	return xs;
}
var reduce = (arr, fn, init) => {
	var prev,next,start;
	if(typeof(init)=='undefined') {
		start=1;
		prev=arr[0];
	} else {
		start=0;
		prev=init;
	}
	for(let i=start;i<arr.length;i++) {
		next = arr[i];
		prev = fn(prev,next);
	};
	return prev;
}

var v = {};
v.createNormByAngle = (degree) => [Math.cos(degree),Math.sin(degree)];
v.scale = (k, v1) => map(v1,(a,i)=>k*a);
v.subtract = (v1,...vs) => reduce(vs, (v1,v2)=>v1.map((a,i)=>a-v2[i]), v1);
v.add = (v1,...vs) => reduce(vs, (v1,v2)=>v1.map((a,i)=>a+v2[i]), v1);
v.dot = (v1, v2) => reduce(map(v1,(a,i)=>v1[i]*(i in v2?v2[i]:1)),(a,b)=>a+b);
v.size = (v1) => Math.sqrt(reduce(v1,(sum,a)=>sum+a*a,0));
v.norm = (v1) => v.scale(1/v.size(v1), v1);
v.angle = (v1) => Math.atan2(v1[1],v1[0]); 
v.cross =(v1, v2) =>[
	v1[1] * v2[2]||0 - v1[2]||0 * v2[1],
	v1[2]||0 * v2[0] - v1[0] * v2[2]||0,
	v1[0] * v2[1] - v1[1] * v2[0]
];
v.wolfram = (list) =>"http://www.wolframalpha.com/input/?i=" + encodeURI(list.map(v=>"vector+"+v.toString()).join('+')); 

var matrix3d = () => [
	[1,0,0,0],
	[0,1,0,0],
	[0,0,1,0],
	[0,0,0,1]
]
var matrix2d = () => [
	[1,0,0],
	[0,1,0],
	[0,0,1]
]
matrix2d.star = (A) {
	var B=matrix();
	for(let i=0;i<A.length;i++) 
		for(let j=0;j<A[i].length;j++)
			B[j][i]=A[i][j];
	return B;
}
matrix3d.star=matrix2d.star;

matrix3d.rotate => (roll, pitch, yaw) => {

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

  return [
	[cosa*cosb, cosa*sinb*sinc - sina*cosc, cosa*sinb*cosc + sina*sinc, 0],
	[sina*cosb, sina*sinb*sinc + cosa*cosc, sina*sinb*cosc - cosa*sinc, 0],
	[-sinb, cosb*sinc, cosb*cosc, 0],
	[0, 0, 0, 1]
  ];
}  
 
matrix3d.translate = ([x,y,z]) => [
	[1,0,0,x],
	[0,1,0,y],
	[0,0,1,z],
	[0,0,0,1]
];
matrix3d.scale = ([x,y,z]) => [
	[x,0,0,0],
	[0,y,0,0],
	[0,0,z,0],
	[0,0,0,1]
];
matrix2d.rotate = (angle) => {
	var sina=Math.sin(angle);
	var cosa=Math.cos(angle);
	return [
		[cos, -sin, 0],
		[sin, cos, 0],
		[0, 0, 1]
	];
};	

matrix2d.translate = ([x,y]) => [
	[1,0,x],
	[0,1,y],
	[0,0,1]
];
matrix2d.scale = ([x,y]) => [
	[x,0,0],
	[0,y,0],
	[0,0,1]
];
    
matrix2d.product = (A,B) => {
	var Astar=matrix2d.star(A);
	var C=matrix2d();
	for(let i=0;i<B.length;i++)
	  for(let j=0;j<B[i].length;j++)
		C[i][j]=v.dot(B[i],Astar[j]);
    return C;
}
matrix3d.product = (A,B) => {
	var Astar=matrix3d.star(A);
	var C=matrix3d();
	for(let i=0;i<B.length;i++)
	  for(let j=0;j<B[i].length;j++)
		C[i][j]=v.dot(B[i],Astar[j]);
    return C;
}