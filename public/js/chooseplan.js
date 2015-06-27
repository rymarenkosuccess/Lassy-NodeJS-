Stripe.setPublishableKey('pk_test_yW8DYr1qeVncL7PFm8Ji5nDQ');

$(document).ready(function () {


  $('input.customcheck').prettyCheckable();
	var stripeResponseHandler = function(status, response) {
      var $form = $('#chooseplan-form');

      if (response.error) {
        // Show the errors on the form
        $form.find('.payment-errors').text(response.error.message);
        $form.find('button').prop('disabled', false);
      } else {
        // token contains id, last4, and card type
        var token = response.id;
        // Insert the token into the form so it gets submitted to the server
        $form.append($('<input type="hidden" name="stripeToken" />').val(token));
        $form.append($('<input type="hidden" name="plan" />').val($('input[name="userplan"]').val()));
        // and submit
        $form.get(0).submit();
      }
     }

    $('#chooseplan-form').submit(function(event) {
		console.log('testing....');
		var $form = $(this);

		// Disable the submit button to prevent repeated clicks
		$form.find('button').prop('disabled', true);

		Stripe.createToken($form, stripeResponseHandler);

		// Prevent the form from submitting with the default action
		return false;
    });  


	$('.month').mask("99");
	$('.year').mask("9999");

});


function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 