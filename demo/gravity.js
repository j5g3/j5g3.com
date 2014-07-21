
(function (j5g3) {
var
	earth = j5g3.image('earth').to_clip().align_children('origin'),
	earthp= j5g3.p4({ target: earth, m: Infinity }),
	container = j5g3.clip(),

	space = j5g3.p4.space({ children: [ earthp ], gravity: 1 }),

	newBall = function(x, y)
	{
		return j5g3.clip({ 
			shape: 'circle', 
			x: x, 
			y: y, 
			radius: 25, 
			width: 50, 
			height: 50 
		}).add(j5g3.image('ball').pos(-25, -25));
	},

	onClick = function(ev) 
	{
	var
		ball = newBall(ev.layerX - container.x, ev.layerY - container.y),
		p = j5g3.p4({ target: ball })
	;
		container.add(ball);
		space.add(p);
	},

	debug = function()
	{
	},

	cog = j5g3.dot({ stroke: 'red', line_width: 5, x: space.gX, y: space.gY} ),

	canvas = this.stage.canvas
;
	container.add(earth);

	this.stage.add([ space, container, cog, debug ])
		.align_children('center middle')
	;
	this.run();

	this.on_destroy = function() { canvas.removeEventListener('click', onClick); };

	canvas.addEventListener('click', onClick);
})
