$(document).ready(function () {
	$('.phone').mask("999-999-9999");

 	var validateActivation = function()
	{
		var name = $('#activation-form input[name="name"]').val(), 
		email = $('#activation-form input[name="email"]').val(),
		code = $('#activation-form input[name="code"]').val(),
		errors = [];

		if(name == "") errors.push({'msg':'Name field is empty.'});
		if(email == "") errors.push({'msg':'Email field is empty.'});
		if(code == "") errors.push({'msg':'Activation Code field is empty.'});

		if(!validateEmail(email)) errors.push({'msg':'Invalid E-mail'});

		return errors;
	}

	var showError = function(errors)
	{
		if(errors.length == 0) return;

		var elst = "<ul>"
		elst += "<p><strong>Oops</strong> there was an error</p>"
		$.each(errors, function(k, v){
			elst += "<li>"+ v.msg+"</li>"
		})
		elst += "</ul>";

		$('#form-error').html(elst)
		$('#form-error').show();
	}

	$('#activation-form .activate-btn').click(function(e){		
		var errs = validateActivation();
		if(errs.length > 0)
		{
			e.preventDefault();
			showError(errs);
			return false;
		}
	});

});


function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 