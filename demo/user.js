
(function(j5g3) {
var
	user = new Droid({ x: 100, y: 300, gravity: 1 }),

	keys = j5g3.mtext("Arrows:\nA:\nZ:\nS:\nX:\nSPACE:").pos(250, 100),
	action = j5g3.mtext("Move\nPunch\nKick\nHi Punch\nHi Kick\nJump").pos(320, 100),

	update = function()
	{
		if (user.y > 370)
		{
			user.y = 370;
			user.p.vy = 0;
		}
	}
;
	this.stage.fill= 'white';
	this.stage.add([ user, keys, action, update ]);

	j5g3.h1.Keyboard.capture();

	this.on_destroy = function()
	{
		j5g3.h1.Keyboard.release();
	}

	this.fps(32).run();
})
