
(function(j5g3) {

var
	shapes = [ 'circle' ], //, 'rect' ],
	colors = [ 'red', 'green', 'blue', '#f0f', '#09f' ],
	
	stage = this.stage,
	space = j5g3.p4.space({ 
		gravity: 0, 
		x:35, y:35, 
		width: stage.width-35, height: stage.height-35 
	}),
	objects = [],

	get_shape = function(x, y)
	{
	var
		shape = shapes[j5g3.irand(shapes.length)],
		shapeFn = j5g3[shape],
		r = shapeFn({ 
			strokeStyle: 'white', 
			fillStyle: colors[j5g3.irand(colors.length)] ,
			radius: 35,
		}).to_clip().pos(x, y).set({ 
			radius: 35, 
			shape: shape, 
			sx: 0.5 + j5g3.rand(1),
			sy: 0.5 + j5g3.rand(1),
			rotation: j5g3.rand(Math.PI)
		}),
		p = j5g3.p4({ target: r } )
	;

		space.add(p);
		objects.push(r);

		return r;
	},

	add_shape = function(ev)
	{
		stage.add(get_shape(ev.layerX, ev.layerY));
	}

;
	stage.add([space]);

	this.on_destroy = function() { 
		stage.canvas.removeEventListener('click', add_shape); 
	};

	stage.canvas.addEventListener('click', add_shape);
	this.fps(32).run();
})
