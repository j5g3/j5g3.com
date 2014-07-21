
(function(j5g3) {

var
	shapes = [ 'circle', ], //'rect' ],
	colors = [ 'red', 'green', 'blue' ],

	// Add a triangle to check segment collisions
	segment1 = j5g3.polygon({ 
		x: 30, y: 450, height: 60, width: 60, 
		points: [ -30, -30, 30, 30, -30, 30 ],
		fill: 'white'
	}),
	
	stage = this.stage,
	space = j5g3.p4.space({ 
		gravity: 1, 
		gX: stage.width/2, 
		gY: Infinity, 
		x:35, y:35, 
		width: stage.width-35, 
		height: stage.height-35
	}),
	objects = [],

	dotA = j5g3.dot({ x: -10, line_width: 4, stroke: '#f40' }),
	dotB = j5g3.dot({ x: -10, line_width: 4, stroke: '#f0f' }),
	collision = j5g3.polygon({ 
		x: 100, y: 100, sx: 20, sy: 20,
		points: [ 0,0, 2,0, 2,-0.25, 2.25,0.25, 2,0.75, 2,0.5, 0,0.5  ], 
		stroke: '#f90' 
	}),

	oldresolve = j5g3.p4.Collision.prototype.resolve,
	momentum = 0,

	resolve= function()
	{
	var
		 c = this.contacts
	;
		momentum = [ this.A.m * this.A.vx + this.B.m * this.B.vx, this.A.m * this.A.vy + this.B.m * this.B.vy, this.A, this.B ];
		dotB.pos(this.A.target.x + c[0], this.A.target.y + c[1]);
		dotA.pos(dotB.x + c[4]*c[2], dotB.y + c[4]*c[2]);
		collision.pos(dotA.x, dotA.y);
		collision.rotation = Math.atan2(c[3], c[2]);
		j5g3.log(c);
		oldresolve.apply(this);
		collision.scale(j5g3.math.magnitude(this.A.fx, this.A.fy), 1);
	},

	get_shape = function(x, y)
	{
	var
		shape = shapes[j5g3.irand(shapes.length)],
		shapeFn = j5g3[shape],
		r = shapeFn({ 
			stroke: 'white', 
			fill: colors[j5g3.irand(colors.length)] ,
			x: -35, y: -35,
			width: 70, height: 70
		}).to_clip().pos(x, y),
		p = j5g3.p4({ target: r  } )
	;

		r.add(r.poslabel = j5g3.text({ font: 'bold 14px sans-serif', x: -34, y: 6, fill: 'white', stroke: 'black' }));

		space.add(p);
		objects.push(r);

		return r;
	},

	add_shape = function(ev)
	{
		stage.add(get_shape(ev.layerX, ev.layerY));
	},

	update = function()
	{
		dbg.text = "Elements: " + objects.length;
		objects.forEach(function(obj) { obj.poslabel.text = obj.x.toFixed(2) + ","  +obj.y.toFixed(2); });
	},

	dbg = j5g3.text({ fill: 'white', y: 30 })
;
	j5g3.p4.Collision.prototype.resolve = resolve;

	space.add(j5g3.p4({ target: segment1, m: 10000, free: false, shape: 'segment' }));

	space.target = stage;
	stage.add([dbg, segment1, space, update, collision, dotA, dotB ]);

	this.on_destroy = function() { 
		stage.canvas.removeEventListener('click', add_shape); 
		j5g3.p4.Collision.prototype.resolve = oldresolve;
	};

	stage.canvas.addEventListener('click', add_shape);
	this.fps(32).run();
})
