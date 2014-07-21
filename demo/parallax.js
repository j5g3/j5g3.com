
(function(j5g3) {
var
	b1 = j5g3.image({ source: j5g3.dom.image('img/trees.png'), f: 1 }),
	b2 = j5g3.image({ source: j5g3.dom.image('img/mountains.png'), f: 0.6 }),
	b3 = j5g3.image({ source: j5g3.dom.image('img/clouds.png'), f: 0.2 }),

	background = new j5g3.gdk.Background({ layers: [ b1, b2, b3 ] }),
	update = function()
	{
		if (background.x < -60)
			background.x = 0;
		else
			background.x--;
	}
;
	background.scale(1.4, 1.4);
	
	this.stage.add([ background, update ]);
	
	this.fps(32).run();
})

