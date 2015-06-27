var querystring = require('querystring'),
	https = require('https');

var twilioConfig = {
	account_sid:'AC3e2e98346bdfe8f29f82f859d077afea',
    token: 'bf95db8d066346ef29b990436218452f',
	number:'+18187412638'
}

exports.sendActivationSMS = function(data, cb)
{
	var textMessage = {
      From: twilioConfig.number, //twilio phone number
      To: data.to,
      Body: 'Your Activation Code is:'+data.activation
    }

    var data = querystring.stringify(textMessage);

    var twilioOptions = {
      hostname: 'api.twilio.com',
      path: '/2010-04-01/Accounts/'+twilioConfig.account_sid+'/SMS/Messages.json',
      method: 'POST',
      port: 443,
      headers: {
        'content-type':'application/x-www-form-urlencoded',
        'Content-Length': data.length
      },
      auth: twilioConfig.account_sid+':'+twilioConfig.token
    }

    var apiRequest = https.request(twilioOptions, function(resp){
      var resBody = '';      
      resp.on('data', function(c){ resBody += c; });
      resp.on('end', function(){
        var jsonBody = JSON.parse(resBody)
        cb(null, jsonBody);
      })
    })

    apiRequest.on('error', function(e) {
      cb(e, null);
    });
    
    apiRequest.end(data);
}

exports.sendSMS = function(data, cb)
{
  var textMessage = {
      From: twilioConfig.number, //twilio phone number
      To: data.to,
      Body: data.message
    }

    var data = querystring.stringify(textMessage);

    var twilioOptions = {
      hostname: 'api.twilio.com',
      path: '/2010-04-01/Accounts/'+twilioConfig.account_sid+'/SMS/Messages.json',
      method: 'POST',
      port: 443,
      headers: {
        'content-type':'application/x-www-form-urlencoded',
        'Content-Length': data.length
      },
      auth: twilioConfig.account_sid+':'+twilioConfig.token
    }

    var apiRequest = https.request(twilioOptions, function(resp){
      var resBody = '';      
      resp.on('data', function(c){ resBody += c; });
      resp.on('end', function(){
        var jsonBody = JSON.parse(resBody)
        cb(null, jsonBody);
      })
    })

    apiRequest.on('error', function(e) {
      cb(e, null);
    });
    
    apiRequest.end(data);
}