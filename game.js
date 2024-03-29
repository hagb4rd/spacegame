var Game = function() {
    var game = {
        progress: 0,
        start: 0,
        t: 0,
        fps: 0,
        actors: []
    }
    game.add = function(actor) {
        game.actors.push(actor);
        actor.parent = game;
    }
    var canvas = document.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    game.controls = {
        up: false,
        down: false,
        left: false,
        right: false,
        zoomin: false,
        zoomout: false
    }
    game.mouse = {
        pos: [0, 0],
        relative: [0, 0],
        angle: 0,
        update() {
            var [x,y] = this.pos;
            this.relative = v.subtract(game.screen.center, this.pos);
            this.relative = [-this.relative[0], this.relative[1]]
            //this.angle=(this.relative.angle+Math.PI/2)%(Math.PI*2);
            this.angle = v.angle([this.relative[0], this.relative[1]]);
            //this.angle = 2*Math.PI-angle;
        },
        draw() {
        }
    }
    game.screen = {
        width: window.innerWidth,
        height: window.innerHeight,
        center: [window.innerWidth / 2, window.innerHeight / 2],
        pos: [0, 0],
        zoom: 1,
        maxzoom: 4,
        minzoom: 0.25,
        projectionMatrix: null,
        update(t) {
            this.pos = typeof (ship) == 'undefined' ? v.create([0, 0]) : ship.pos;
            this.width = canvas.width = window.innerWidth,
            this.height = canvas.height = window.innerHeight,
            this.center = [window.innerWidth / 2, window.innerHeight / 2]

            if (game.controls.zoomin)
                this.zoom += t;
            if (game.controls.zoomout)
                this.zoom -= t;
            if (this.zoom > this.maxzoom)
                this.zoom = this.maxzoom;
            if (this.zoom < this.minzoom)
                this.zoom = this.minzoom;

            var scale = matrix2d.scale([this.zoom, -this.zoom])
            var translate = matrix2d.translate(v.add(this.center, v.scale(this.zoom, [-this.pos[0], this.pos[1]])));
            this.projectionMatrix = matrix2d.product(scale, translate);
        },
        draw() {
            ctx.font = '14pt Arial';
            ctx.strokeStyle = 'red';
            ctx.strokeText(`fps: ${game.fps} pos: [${ship.pos[0].toFixed(1)},${ship.pos[1].toFixed(1)}] v: [${ship.velocity[0].toFixed(1)},${ship.velocity[1].toFixed(1)}] angle: ${deg(game.mouse.angle).toFixed(1)}`, 14, 14);
        }
    }


                
    //Ship: Actor .. game.add(actorL: Actor) // add them to game loop. and .dispose() to garbage wehn needed
    var ship = new Ship();
    game.add(ship);

    //abstract class Actor sample
    // each Actor implements update() and draw() invoked each game loop
    var Rock = class extends Actor {
        constructor() {
            super();
            this.detectCollisions = true;
            this.pos = [200, 200];
            this.vertex = [[10, -20], [-10, -20], [0, 20]];
            //this.radius = v.create(this.vertex[0]).size;
            this.lines = [[0, 1, 2, 0]];
        }
        onCollision(actor) {
            this.color="red";
        }
        /*
		update(t){
			super.update(t)
		}
		
		draw(){
			super.draw()
		}
		/* */
    }
    ;
    game.add(new Rock());

    game.loop = (function(time) {
        //update time
        if (!game.start)
            game.start = time;
        var swap = (time - game.start) / 1000;
        game.t = game.progress ? swap - game.progress : 0;
        game.progress = swap;
        game.framecount++;
        game.timeUntilSecond = game.timeUntilSecond || 0;
        game.timeUntilSecond += game.t;
        if (game.timeUntilSecond > 1) {
            game.fps = game.framecount;
            game.framecount = 0
            game.timeUntilSecond = 0;
        }

        //screen 
        game.screen.update(game.t);
        game.mouse.update(game.t);

        game.actors = game.actors.filter(actor=>!actor.disposed);

        //update all actors
        game.actors.forEach(actor=>actor.update(game.t));
        //update ship
        //ship.update(game.t);

        //.. & draw
        game.screen.draw(ctx);
        game.actors.forEach(actor=>actor.draw(ctx));
        //ship.draw(ctx);

        requestAnimationFrame(game.loop);
    }
    ).bind(game);

    game.loop();



    //document binding
    function touch(e) {
        var {pageX: x, pageY: y} = e.originalEvent.touches[0];
        game.mouse.pos = [x, y];
    }

    function mousemove(e) {
        var {pageX: x, pageY: y} = e;
        game.mouse.pos = [x, y];
    }

    function resize() {
        game.screen.update();
    }

    function onkeydown(e) {
        //console.log(e);
        if (e.key == 'ArrowUp')
            game.controls.up = true;
        if (e.key == 'z')
            if (!game.controls.zoomout)
                game.controls.zoomin = true;
        if (e.key == 'x')
            if (!game.controls.zoomin)
                game.controls.zoomout = true;
    }

    function onkeyup(e) {
        //console.log(e);
        if (e.key == 'ArrowUp')
            game.controls.up = false;
        if (e.key == 'z')
            game.controls.zoomin = false;
        if (e.key == 'x')
            game.controls.zoomout = false;
    }

    function onclick(e) {
        ship.fire();
    }

    window.addEventListener('resize', resize);
    window.addEventListener('touchstart', touch);
    window.addEventListener('touchmove', touch);
    window.addEventListener('mousemove', mousemove);
    document.addEventListener('keydown', onkeydown);
    document.addEventListener('keyup', onkeyup);
    document.addEventListener('click', onclick);

    return game;
}
var game = Game();
