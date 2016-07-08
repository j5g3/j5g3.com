window.j5g3({

	stage_settings: {
		width: 1024,
		height: 660
	},

	startFn: function(j5g3) {

"use strict";

var
	//////////////////////
	//
	// CONSTANTS
	//
	//////////////////////
	WIDTH = this.stage.width,
	HEIGHT = this.stage.height,

	//////////////////////
	//
	// GLOBALS
	//
	//////////////////////
	$loader = j5g3.loader(),

	$assets = {
		ss: $loader.img('assets/asteroids_ss.png'),
		space: $loader.img('assets/asteroids_BG.png'),
		spritesheet: j5g3.spritesheet(),

		saucer: $loader.audio('assets/asteroids_saucer.wav'),
		shoot: $loader.audio('assets/asteroids_shoot.wav'),
		thrust: $loader.audio('assets/asteroids_thrust.wav'),
		explosion: $loader.audio('assets/asteroids_explosion.wav'),

		sound: function(asset)
		{
			var s = asset.cloneNode();
			s.volume = asset.volume;
			s.play();
		}
	},

	$stage = this.stage,

	$background = $stage.layer({ background: true }),
	$foreground = $stage.layer(),

	// Handle Input.
	$input = j5g3.in($foreground.canvas),

	///////////////////////
	//
	// ENTITIES
	//
	///////////////////////
	Player = j5g3.Clip.extend({

		torque: 0.2,
		acceleration: 0.5,

		radius: 30,
		lives: 5,

		fireDelay: 0,
		// Initial Speed of Bullet
		fireSpeed: 10,
		accelDelay: 0,
		invincibility: 200,

		// Set to tru to ignore for the first 60 frames
		is_asteroid: true,
		is_player: true,

		vx: 0,
		vy: 0,
		cx: -37,
		cy: -35,

		setup: function()
		{
		var
			ss = $assets.spritesheet,
			normal = this.normal = ss.clip([11]),
			accelerate = ss.clip([9, 10]),
			explode = ss.clip([12, 13, 14])
		;
			normal.st = 0.1;
			normal.add_frame();

			explode.st = 0.5;
			explode.add_frame(function() {
					explode.parent.remove();
					explode.go(0);
				})
				.pos(-42, -46)
				.go(0)
			;

			this.sx = this.sy = 0.8;

			this.add(normal)
				.add_frame(accelerate)
				.add_frame(explode)
				.stop()
				.reset(true)
			;
		},

		update_frame: function()
		{
			if (this.exploding)
				return;

			if (this.fireDelay>0)
				this.fireDelay--;

			if (this.accelDelay>0)
				this.accelDelay--;
			else if (this.accelDelay===0)
			{
				this.go(0);
				this.accelDelay = null;
				//this.decelerate();
			}
		},

		reset: function(reset_pos)
		{
		var
			me = this,
			normal = me.normal,
			tween = j5g3.tween({
				duration: this.invincibility,
				auto_remove: true,
				on_remove: function()
				{
					me.is_asteroid = false;
					normal.go(0).stop();
				}
			})
		;
			if (reset_pos)
				me.set({
					x: $stage.width/2,
					y: $stage.height/2,
					vx: 0, vy: 0,
					rotation: -Math.PI/2
				});

			me.is_asteroid= true;
			me.go(0);

			$stage.add(tween);
			me.exploding = false;
			normal.play();
			$input.enable();
		},

		/**
		 * Explodes ship, p is point of collision
		 */
		explode: function(p)
		{
			if (this.exploding || p.A.friendly ||
				p.B.friendly || this.is_asteroid)
				return;

			$assets.sound($assets.explosion);
			$input.disable();
			this.exploding = true;
			this.go(2);
			this.lives--;
		},

		left: function()
		{
			this.rotation -= this.torque;
		},

		right: function()
		{
			this.rotation += this.torque;
		},

		accelerate: function()
		{
			this.go(1);
			this._update_v(this.acceleration);
			this.accelDelay = 10;
			$assets.sound($assets.thrust);
		},

		decelerate: function()
		{
			this.vx = 0;
			this.vy = 0;
		},

		fire: function()
		{
		var
			dx, dy,
			r = this.radius+5
		;
			if (this.fireDelay===0 && this.parent)
			{
				dx = Math.cos(this.rotation);
				dy = Math.sin(this.rotation);

				this.parent.add(new Bullet({
					vx: dx*this.fireSpeed,
					vy: dy*this.fireSpeed,
					x: this.x + dx*r,
					y: this.y + dy*r,
					friendly: true
				}));
				$assets.sound($assets.shoot);

				this.fireDelay = 10;
			}
		},

		_update_v: function(a)
		{
			this.vx += a * Math.cos(this.rotation);
			this.vy += a * Math.sin(this.rotation);
		}

	}),

	Alien = j5g3.Clip.extend({

		cy: -19,
		cx: -37,

		vy: 0,
		radius: 20,
		score: 0,
		fireDelay: 50,
		fireSpeed: 5,
		player: null,

		setup: function()
		{
			$assets.saucer.loop = true;
			this.add($assets.spritesheet.sprite(15));
		},

		reset: function()
		{
		var
			dy = j5g3.irand(200)
		;
			this.y = (Math.random() > 0.5) ? HEIGHT-dy : dy;

			if (Math.random() > 0.5)
			{
				this.x = WIDTH-this.cx;
				this.vx = -2-j5g3.rand(4);
			} else
			{
				this.x = this.cx;
				this.vx = 2+j5g3.rand(4);
			}

			$assets.saucer.play();
			return this;
		},

		remove: function()
		{
			$assets.saucer.pause();
			j5g3.DisplayObject.prototype.remove.call(this);
		},

		update_frame: function()
		{
			if (this.x===this.cx || this.x===WIDTH-this.cx)
				this.remove();

			if (this.fireDelay-- === 0)
				this.fire();
		},

		fire: function()
		{
		var
			dx = this.player.x - this.x,
			dy = this.player.y - this.y,
			mag = Math.sqrt(dx*dx+dy*dy),
			nx = dx/mag, ny = dy/mag
		;
			if (this.parent)
				this.parent.add(new Bullet({
					x: this.x + (this.radius)*nx,
					y: this.y + (this.radius+30)*ny,
					vx: this.fireSpeed*nx,
					vy: this.fireSpeed*ny,
					life: 45,
					enemy: true
				}));

			this.fireDelay = 40;
		},

		explode: function(p)
		{
		var
			ex
		;
			if (p.A.enemy || p.B.enemy)
				return;

			this.score = (p.A.friendly || p.B.friendly) ? 500 : 0;

			ex = $assets.spritesheet.clip([ 12, 13, 14 ]);
			ex.st = 0.5;

			ex.pos(this.x, this.y)
				.align_children('origin')
				.add_frame(ex.remove.bind(ex))
				.go(0)
			;

			$assets.sound($assets.explosion);
			$stage.add(ex);
			this.remove();
		}

	}),

	Space = j5g3.Clip.extend({

		collision: null,
		// Callback
		on_explode: null,
		on_level_clear: null,

		setup: function()
		{
			this.collision = new j5g3.Collision.Circle();
			this.collisionFn = this.do_collision.bind(this);
		},

		do_collision: function(a, b)
		{
		var
			coll
		;
			if (this.collision.query(a, b) && !(a.is_asteroid && b.is_asteroid))
			{
				j5g3.extend(coll = {}, this.collision);
				setTimeout(function() {
					a.explode(coll);
					b.explode(coll);
				}, 0);

				this.on_explode(a, b);
			}
		},

		add_object: function(obj)
		{
			obj._x = obj.x;
			obj._y = obj.y;
			j5g3.Clip.prototype.add_object.apply(this, [ obj ]);
		},

		update_frame: function()
		{
		var
			asteroids=0
		;
			if (!this.playing)
				return;

			this.each(function(clip) {
				if (!clip.is_bullet)
				{
					if (clip.x > $stage.width-clip.cx)
						clip.x = clip._x = clip.cx;
					else if (clip.x < clip.cx)
						clip.x = clip._x = $stage.width-clip.cx;
					if (clip.y > $stage.height-clip.cy)
						clip.y = clip._y = clip.cy;
					else if (clip.y < clip.cy)
						clip.y = clip._y = $stage.height-clip.cy;
				}

				clip._x += clip.vx;
				clip._y += clip.vy;
				clip.x = clip._x | 0;
				clip.y = clip._y | 0;

				if (clip.w)
					clip.rotation += clip.w;

				if (clip.is_asteroid && !clip.is_player)
					asteroids += 1;
			});

			if (asteroids===0)
				this.on_level_clear();
			else
				this.each_pair(this.collisionFn);
		}
	}),

	Asteroid = j5g3.Clip.extend({

		maxv: 4,
		maxt: 0.05,
		radius: 122,
		score: 20,

		vx: null,
		vy: null,
		w: null,

		explode_to: null,
		is_asteroid: true,

		cut: function(ss)
		{
			this.add(ss.sprite(2));
		},

		explosion: function()
		{
		var
			explode = $assets.spritesheet.clip([
				3, 4, 5, 6, 7, 6, 5, 4, 3
			])
		;
			explode.add_frame(explode.remove.bind(explode))
				.go(0)
			;
			explode.pos(this.x, this.y);
			explode.align_children('origin');
			//explode.st = 1;

			return explode;
		},

		setup: function()
		{
		var
			ss = $assets.spritesheet
		;
			this.cut(ss);
			this.stop()
				.go(0)
			;

			if (this.vx===null)
				this.vx = -this.maxv + j5g3.rand(this.maxv*2);
			if (this.vy===null)
				this.vy = -this.maxv + j5g3.rand(this.maxv*2);
			if (this.w===null)
				this.w= j5g3.rand(this.maxt);

			this.cx = this.cy = -this.radius;
		},

		explode: function(collision)
		{
		var
			p, nx, ny
		;
			if (!this.parent)
				return;

			if (this.explode_to)
			{
				nx = -(1+j5g3.rand(this.maxv)*collision.ny);
				ny = 1+j5g3.rand(this.maxv)*collision.nx;
				p = {
					x: this.x+nx*this.radius/2,
					y: this.y+ny*this.radius/2,
					vx: nx, vy: ny
				};

				this.parent.add(new this.explode_to(p));
				p.vx = -p.vx; p.vy = -p.vy;
				p.x = this.x-nx*this.radius/2;
				p.y = this.y-ny*this.radius/2;
				this.parent.add(new this.explode_to(p));
			}

			$assets.sound($assets.explosion);
			$stage.add(this.explosion());
			this.remove();
		}

	}),

	AsteroidSmall = Asteroid.extend({

		radius: 34,
		maxv: 5,
		maxt: 0.1,
		source: $assets.asteroid_s,
		explode_to: null,
		score: 100,

		cut: function(ss)
		{
			this.add(ss.sprite(1));
		}
	}),

	AsteroidMedium = Asteroid.extend({

		radius: 71,
		maxv: 4.5,
		source: $assets.asteroid_m,
		explode_to: AsteroidSmall,
		score: 50,

		cut: function(ss)
		{
			this.add(ss.sprite(0));
		}

	}),

	AsteroidLarge = Asteroid.extend({

		explode_to: AsteroidMedium

	}),

	Bullet = j5g3.Sprite.extend({

		// Life in frames
		life: 50,

		radius: 5,
		friendly: false,
		is_bullet: true,

		vx: 0,
		vy: 0,
		cx: -4,
		cy: -5,

		init: function(p)
		{
			this.source = $assets.spritesheet.sprite(17).source;
			j5g3.Sprite.apply(this, [p]);
		},

		update: function()
		{
			if (this.life-- === 0)
				this.remove();
		},

		explode: function()
		{
			$assets.sound($assets.explosion);
			this.remove();
		}

	}),

	Score = j5g3.Clip.extend({

		y: 20,
		points: 0,

		lives: function(n)
		{
		var
			s, x=-32
		;
			this.livesLabel.remove_frame()
				.add_frame();

			while (n--)
			{
				s = $assets.spritesheet.sprite(8);
				s.x = (x += 44);
				this.livesLabel.add(s)
				;
			}

			this.livesLabel.invalidate();
		},

		hide_points: function()
		{
			this.pointsLabel.invalidate();
			this.pointsLabel.remove();
		},

		score: function(n)
		{
			this.points += n;
			this.pointsLabel.text = this.points;
			this.pointsLabel.align_text('right');

			if (n)
				this.pointsLabel.invalidate();
		},

		setup: function()
		{
			this.livesLabel = j5g3.clip({
				x: 30, height: 50, width: 100
			});
			this.pointsLabel = j5g3.text({
				font: '30px "Press Start 2P"',
				fill: '#eee',
				text: this.points,
				x: $stage.width - 30,
				height: 50
			});
			this.add([
				this.livesLabel,
				this.pointsLabel
			]);
			this.score(0);
		}

	}),

	////////////////////////////////
	//
	// SCENES
	//
	////////////////////////////////
	Loading = j5g3.Clip.extend({

		fill: '#fff',

		init_spritesheet: function()
		{
		var
			ss = $assets.spritesheet
		;
			ss.source = $assets.ss;

			ss.slice(0,0,143,139); // asteroid_m
			ss.slice(0,139, 67, 66); // asteroid_s
			ss.slice(260, 238, 241, 240); //asteroid_l
			ss.slice(67, 139, 63, 71, 'explosion1');
			ss.slice(0, 210, 91, 104, 'explosion2');

			ss.slice(130, 176, 130, 131, 'explosion3');
			ss.slice(143, 0, 187, 176, 'explosion4');
			ss.slice(330, 0, 235, 238, 'explosion5');
			ss.slice(91, 210, 39, 35, 'miniship');
			ss.slice(0, 314, 72, 68, 'ship-thrust1');

			ss.slice(0, 382, 72, 68, 'ship-thrust2');
			ss.slice(0, 450, 72, 68, 'ship');
			ss.slice(72, 473, 157, 159, 'ship-explode1');
			ss.slice(72, 632, 157, 145, 'ship-explode2');
			ss.slice(72, 314, 157, 159, 'ship-explode3');

			ss.slice(260, 478, 75, 38, 'alien');
			ss.slice(0,0,0,0, 'empty');
			ss.slice(91, 245, 9, 9, 'bullet');
		},

		init_audio: function()
		{
			$assets.explosion.volume = 0.5;
		},

		setup: function()
		{
			this.loading = j5g3.text({ font: '20px "Press Start 2P"' })
				.pos(10, 30);
			this.add(this.loading);

			$loader.on_progress = this.on_progress.bind(this);
			$loader.ready(this.on_ready.bind(this));
		},

		on_progress: function(p)
		{
			this.loading.text = 'Loading ' + (p*100|0) + '%';
		},

		on_ready: function()
		{
			this.remove();
			this.init_spritesheet();
			this.init_audio();
			$stage.add(new Splash());
		}

	}),

	Splash = j5g3.Clip.extend({

		fill: '#eee',
		width: WIDTH,
		height: HEIGHT,

		setup: function()
		{
		var
			title = j5g3.text({
				y: 150,
				font: '60px "Press Start 2P"',
				text: "Asteroids",
				height: 60
			}),
			msg = j5g3.text({
				y: 250,
				font: '24px "Press Start 2P"',
				text: 'Press any key to start',
				height: 24
			})
		;

			title.align_text('center');
			msg.align_text('center');

			this.add([ title, msg ])
				.align_children('center')
			;

			$input.on_fire = this.on_fire.bind(this);

			$background.add($assets.space);
			$background.invalidate();
		},

		on_fire: function(ev)
		{
			if (ev.name!=='move')
			{
				this.remove();
				$input.on_fire = null;
				$input.disable();
				$stage.add(new Game());
				return false;
			}
		}

	}),

	Game = j5g3.Clip.extend({

		level: 1,
		start_time: null,
		end_time: null,
		// Time in milliseconds
		max_time: 3*60*1000,
		saucer_delay: 800,
		touchpad: null,

		get_asteroid: function()
		{
		var
			a = new AsteroidLarge({
				x: j5g3.irand($stage.width),
				y: j5g3.irand($stage.height)
			});

			return a;
		},

		init_player: function(reset_pos)
		{
		var
			text = j5g3.text({
				text: 'Level ' + this.level,
				font: '30px "Press Start 2P"',
				fill: '#eee',
				x: WIDTH/2,
				y: 100
			}),
			me = this
		;
			text.align_text('center');

			$foreground.add([
				text,
				j5g3.tween({
					target: text, life: 60, auto_remove: true,
					on_remove: function() {
						text.remove();
						$foreground.invalidate();
					}
				})
			]);

			this.player.reset(reset_pos);

			if ($input.module.Touch)
				$input.module.Touch.angle = this.player.rotation;

			this.space.add(this.player);
			this.score.lives(this.player.lives);
		},

		init_level: function()
		{
		var
			n = this.level+1
		;
			while (n--)
				this.space.add(this.get_asteroid());

			this.init_player();
			this.level_start();
		},

		level_start: function()
		{
			this.space.play();
		},

		game_over: function()
		{
		var
			text = j5g3.text({
				text: 'GAME OVER',
				x: WIDTH/2, y: 100,
				fill: '#eee',
				font: '50px "Press Start 2P"'
			}),
			t = Date.now() - this.start_time,
			min = t/60000|0,
			sec = (t%60000)/1000|0,

			pad = function(x)
			{
				return ("00" + x).substr(-2);
			},

			time = j5g3.text({
				text: 'Time: ' + pad(min) + ':' + pad(sec),
				x: WIDTH/2, y: 200,
				fill: '#ecc',
				font: '30px "Press Start 2P"'
			}),
			score = j5g3.text({
				text: 'Score: ' + this.score.points,
				x: WIDTH/2, y: 250,
				fill: '#eee',
				font: '50px "Press Start 2P"'
			})
		;
			text.align_text('center');
			time.align_text('center');
			score.align_text('center');

			$foreground.add([ text, time, score ]);
			$foreground.invalidate();
			$input.disable();

			this.score.lives(0);
			this.score.hide_points();
			this.is_game_over = true;

			if (this.touchpad)
				this.touchpad.remove();

			// Save Score to localStorage
			window.localStorage.Asteroids = JSON.stringify({
				score: this.score.points,
				t: t
			});
		},

		update_frame: function()
		{
			if (this.space.playing && !this.player.parent && !this.is_game_over)
			{
				if (this.player.lives>0)
					this.init_player(true);
				else
					this.game_over();
			} else if (this.saucer_delay-- === 0)
				this.on_alien();

			if (!this.is_game_over && Date.now()>=this.end_time)
			{
				this.player.remove();
				this.game_over();
			}
		},

		on_explode: function(a, b)
		{
		var
			score = (a.score||0) + (b.score||0)
		;
			if (score && !this.is_game_over)
				this.score.score(score);
		},

		on_level_clear: function()
		{
			if (this.is_game_over)
				return;

			this.level++;
			this.init_level();
		},

		on_alien: function()
		{
			this.saucer_delay = 800;
			if (this.alien.parent)
				return;

			this.space.add(this.alien.reset());
		},

		init_touch: function()
		{
		var
			touch = $input.module.Touch
		;
			// Ipad Touch Event Fixes
			if (touch)
			{
				document.addEventListener('touchmove', function(ev) {
					ev.preventDefault();
					return false;
				});

				touch.x_threshold = touch.y_threshold = 4;
				touch.move_type = 'radial';

				$input.module.Mouse.destroy();
				$foreground.add(this.touchpad = new TouchPad({ player: this.player }));
			}
		},

		init_input: function()
		{
		var
			me = this,
			player = me.player
		;
			me.init_touch();

			$input.on({
				'left': player.left.bind(player),
				'right': player.right.bind(player),
				'up': player.accelerate.bind(player),
				'buttonB': player.fire.bind(player),
				'buttonY': me.touchpad ?
					function() {
						me.touchpad.hit($input.x, $input.y);
					} : function() {
						player.fire();
					}
			});
		},

		setup: function()
		{
		var
			player = this.player = new Player(),
			space = this.space = new Space(),
			score = this.score = new Score()
		;
			this.alien = new Alien({ player: player });

			space.stop();
			space.on_explode = this.on_explode.bind(this);
			space.on_level_clear = this.on_level_clear.bind(this);

			$foreground.add(score);
			$foreground.invalidate();

			this.add(space);
			this.init_input();
			this.init_level();
			this.start_time = Date.now();
			this.end_time = this.start_time + this.max_time;
		}
	}),

	TouchPad = j5g3.Clip.extend({

		y: HEIGHT-100,
		fill: '#eee',
		player: null,
		joydelay: 0,

		checkButton: function(x,y,b)
		{
			return (x>b.x-10 && (x<b.x+b.radius*2) && y>this.y-10 && (y<this.y+b.radius*2)) && b.fn;
		},

		hit: function(x, y)
		{
		var
			ev = this.checkButton(x, y, this.buttonY) ||
				this.checkButton(x, y, this.buttonX)
		;
			if (ev)
				ev.call(this.player);
			else if (x < WIDTH/2)
			{
				$input.module.Touch.angle = this.player.rotation;
				this.joydelay = 60;
			}
		},

		onmove: function(ev)
		{
			if (ev.angle && $input.x<WIDTH/2)
				this.player.rotation = ev.angle;
		},

		update_frame: function()
		{
			if (this.joydelay>0)
			{
				this.stick.rotation = this.player.rotation;
				this.joydelay--;
				if (!this.stick.parent)
					$stage.add(this.stick);
			} else if (this.joydelay===0)
			{
				this.stick.remove();
				this.joydelay=null;
			}

		},

		setup: function()
		{
		var
			me = this,
			bX = j5g3.clip({ x: WIDTH-200, radius: 32, fn: Player.prototype.accelerate }).add([
				j5g3.circle({ alpha: 0.5, radius: 32 }),
				$assets.spritesheet.cut(100, 245, 26, 34).pos(13, 15).scale(1.5, 1.5)
			]),
			bY = j5g3.clip({ x: WIDTH-100, radius: 32, fn: Player.prototype.fire }).add([
				j5g3.circle({ alpha: 0.5, radius: 32 }),
				$assets.spritesheet.cut(260, 516, 64, 68).pos(7, 5).scale(0.8, 0.8)
			]),
			joy = j5g3.clip({ x: 50 }).add([
				j5g3.circle({ alpha: 0.5, radius: 32 }),
				$assets.spritesheet.cut(335, 478, 117, 117).pos(-27, -25)
			]),

			dir = this.stick = j5g3.circle({
				x: 82, radius: 10, fill: '#e00', alpha: 0.7,
				y: HEIGHT-70, cy: -10, cx: 40, rotation: -Math.PI/2
			})
		;
			$input.on('move', this.onmove.bind(this));
			$input.module.Touch.set_pivot = function(obj) {
				obj.pivotx = dir.x;
				obj.pivoty = dir.y;
			};
			this.add([ this.buttonY = bY, this.buttonX = bX, joy ]);
		}

	}),

	engine = this
;
	$stage.add([ $background, new Loading(), $foreground ]);

	// Orientation Fix
	function reorient(e) {
		if (window.orientation % 180 === 0)
			engine.resume();
		else
			engine.pause();
	}

	function resize() {
		$input.sx = $stage.canvas.width / $stage.canvas.clientWidth;
		$input.sy = $stage.canvas.height / $stage.canvas.clientHeight;
	}

	window.onorientationchange = reorient;
	reorient();

	if (!navigator.isCocoonJS)
	{
		window.addEventListener('resize', resize);
		resize();
	}

	this.fps = 45;
	this.run();

	// Debug Module
	window.dbg && window.dbg($assets, $stage);

}});