
(function (j5g3) {

var 
	MAX_BALLS = 50,
	RADIUS = j5g3.id('ball').width/2,
	MAX_SPEED = 5,
	WIDTH = this.stage.width,
	HEIGHT= this.stage.height,
	MAX_X = WIDTH-RADIUS,
	MAX_Y = HEIGHT-RADIUS,
	
	space = j5g3.p4.space({ 
		x:RADIUS, 
		y:RADIUS, 
		width: MAX_X, 
		height: MAX_Y
	}),

	stage = this.stage,

	Ball = j5g3.Image.extend({
		
		shape: 'circle',
		radius: RADIUS,

		init: function()
		{
			j5g3.Image.apply(this);
			this.set_source('ball').pos(j5g3.rand(MAX_X), j5g3.rand(MAX_Y));
			space.add(j5g3.p4({ target: this, vx: j5g3.rand(MAX_SPEED), vy: j5g3.rand(MAX_SPEED) }));
		},

		/* Ugly hack to draw image at center of gravity... TODO See if we can remove this. */
		draw: function() 
		{
			stage.context.drawImage(this.source, this.x-RADIUS, this.y-RADIUS);
		}

	}),

	dbg = j5g3.text({ y: 30, x: 20, fill: 'white' }),

	objs, i
;
	this.fps(60);

	for (i = 0; i < MAX_BALLS; i++)
		this.stage.add(new Ball());

	this.stage.add([ space, dbg ]);

	this.run();
})

