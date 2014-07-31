
(function()
{
var
	demo = document.getElementById('demos'),
	iframe = document.getElementById('screen'),
	option, rand,
	base = '//j5g3.github.io/demo/'
;
	demo.onchange = function()
	{
		option = demo.options[demo.selectedIndex] || demo.options[0];
		rand = Date.now();

		iframe.src = base + (option.hasAttribute('compiled') ?
			'compiled.html?' :
			'demo.html?') + rand + '#' + demo.value;
	};

})();