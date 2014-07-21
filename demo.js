
(function onload()
{
var
	// GLOBALS
	$loader = j5g3.loader(),
	$input,
	$engine,

	// LOCALS
	list = j5g3.id('demos'),
	code,

	get_url = function()
	{
		return 'demo/' + list.value.toLowerCase() + '.js';
	},

	onAjax = function()
	{
		if ($engine)
			$engine.destroy();

		if ($input)
			$input.destroy();

		$input = j5g3.in('screen');

		// Clear all styles
		j5g3.id('screen').setAttribute('style', '');

		// uhhh eval
		if (list.value)
			$engine = j5g3.engine(eval(code.raw));
	}
;
	list.onchange = function()
	{
		code = $loader.data(get_url());
		$loader.ready(onAjax);
	};

	window.view_source = function()
	{
		window.open(get_url(), '_blank');
	};

})();
