$(document).ready(function () {
	$('.phone').mask("999-999-9999");

	var nameEmailForm = function(){		
		$('#congrats-popup .modal-body').show()
		$('#congrats-popup .loader-wrap').hide()
	}

	$('#activation-form .activate-btn').click(function(e){		
		e.preventDefault();

		var data = $('#activation-form').serialize();

		$('#congrats-popup .loader-wrap').show();
		$('#congrats-popup .alert-congrats').hide();
		$('.modal-backdrop').removeClass('hide').addClass('in');
		$('#congrats-popup').removeClass('hide').addClass('in');

		$.ajax({
			url: '/doactivation',
			data: data,
			type: 'POST',
			success: function(resp){
				if(resp.result){
					$('input.activation-code').val($('#activation-form input[name="code"]').val());
					nameEmailForm()
				}else{
					$('#congrats-popup .loader-wrap').hide();
					$('#congrats-popup .alert-congrats').show();
				}
			}
		})

	})

	$('#congrats-popup .okay-btn').click(function(){
		$('.modal-backdrop').removeClass('in').addClass('hide');
		$('#congrats-popup').removeClass('in').addClass('fade');
		return false;
	})

	$('#update-form input[type="submit"]').click(function(e){
		
		var name = $('#update-form input[name="fullname"]').val(),
		email = $('#update-form input[name="email"]').val();

		if(name == '' || email == '')
		{
			//show error
			e.preventDefault();
			$('#update-form .alert').show();
			$('#update-form .alert .alert-text').text('Name and email fields are required.')
			setTimeout(function(){ $('#update-form .alert').hide(); }, 3000);
		}else{
			if(!validateEmail(email))
			{
				e.preventDefault();
				$('#update-form .alert').show();
				$('#update-form .alert .alert-text').text('Email address is not valid.')
				setTimeout(function(){ $('#update-form .alert').hide(); }, 3000);
			}			
		}

	})

});


function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 