$(document).ready(function () {
	$('#choose_img').click(function() {
		$('input[name=photo]').trigger('click');
	});
	$('input[name=photo]').change(function(e) {
		var file = e.target.files[0];
		$.canvasResize(file, {
			width: 300,
			height: 0,
			crop: false,
			quality: 80,
			//rotate: 90,
			callback: function(data, width, height) {
				$('#preview_pic').attr('src', data);
			}
		});
	});
});
