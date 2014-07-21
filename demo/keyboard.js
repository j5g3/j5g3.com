
(function (j5)
{
var 
	i, a, key, keyboard = j5.id('keyboard'),
	keycode = j5.id('keyboard-code'),
	container = j5.id('keyboard-container'),
	canvas = j5.id('screen'),

	keymap = [
		27, 0, 112, 113, 114, 115, 0, 116, 117, 118, 119, 0, 120, 121, 122, 123, 0, 0, 145, 19,
		0,
		192, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 189, 187, 8, 0, 45, 36, 33,
		9, 81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 219, 221, 220, 0, 46, 35, 34,
		20, 65, 83, 68, 70, 71, 72, 74, 75, 76, 186, 222, 13, 0,
		16, 90, 88, 67, 86, 66, 78, 77, 188, 190, 191, 16, 0, 38, 0,
		17, 0, 18, 32, 18, 0, 0, 17, 0, 37, 40, 39 
	],
	clearKey = function(k)
	{
		key = keyboard.children[0];
		do {
			key.classList.remove('pressed');

		} while (key = key.nextElementSibling);
	},
	highlightKey = function(k)
	{
		a = keymap.length;
		while (a--)
			if (keymap[a]==k) 
				keyboard.children[a].classList.add('pressed');
		
	},
	updateKeyboard = function() {
		clearKey();

		for (i in j5.h1.Key)
			if (j5.h1.Key[i])
			{
				keycode.innerHTML = i + ' - ' + String.fromCharCode(i);
				highlightKey(i);
			}

		setTimeout(updateKeyboard, 300);
	},
	timeout
;
	container.style.display = 'block';
	canvas.style.display = 'none';

	this.on_destroy = function() { 
		j5.h1.Keyboard.release(); 
		container.style.display = 'none';
		canvas.style.display = '';
	};
	
	j5.h1.Keyboard.capture()
	

	timeout = setTimeout(updateKeyboard, 300);

})
