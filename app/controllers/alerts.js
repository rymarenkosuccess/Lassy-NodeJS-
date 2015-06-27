/*
* Sends/Receives/Escalate
*/
var mongoose = require('mongoose')
  , Alert = mongoose.model('Alert')
  , Lassy = mongoose.model('Lassy')
  , User = mongoose.model('User')
  , twilio = require('../../config/middlewares/twilio')
  , async = require('async')


/*
* POST /m/alert/new - From mobile
* Data
* lassyID, lat&lon (last coordinates), mobile number
*/
exports.new = function(req, res)
{
	var lid = req.param('lassyid', false)
	, lat = req.param('lat', false)
	, lon = req.param('lon', false)
	, deviceId = req.param('deviceid', false);

	if(lid && lat && lon && deviceId)
	{
		Lassy.findOne({_id:lid, "devices.device_id":deviceId}, function(err, lassy){
			if(err) res.send({result:false, error:'Could not locate device or lassy'});

			/*
			Create a token with expiration using Redis for security
			The token will need to escalate alert, so that is only done once. This
			also prevents multiple calls to the endpoint. For now lets just work without it.
			*/
			var alert = new Alert();
			alert.token = '';
			alert.lassyID = lassy._id;
			alert.userID = lassy.userID;
			alert.posted = new Date();
			alert.status = "open";
			alert.lastcoors = [parseFloat(lat), parseFloat(lon)];
			alert.save(function(err, obj){
				if(err) res.send({result:false, error:'Could not create alert'});
				else res.send({result:true, token:''})

				//notify user
				User.findOne({_id:lassy.userID}, function(err, user)
				{
					if(err)
					{
						console.log('Could not find user to send alert.');
					}else{
						var msg = lassy.name + " has gone off course " + "http://thelassyproject/m/alert/"+obj._id;
						twilio.sendSMS({to:'+1'+user.mobile_number.replace('-',''), message:msg}, function(errs, result){     
          					if(errs) console.log('Could not send text to user');
          					else console.log('User has been notified');
        				})
					}
				})

			})
		})
	}
}

/*
* GET /m/alert/:id
*/
exports.view = function(req, res)
{
	if(req.params.id)
	{
		var aID = req.params.id
		res.render('alerts/view', {});
		/*Alert.findOne({_id:aID}, function(err, alertDoc){
			if(err) res.send("cant find alert")

			Lassy.findOne({_id:alertDoc.lassyID}, function(err, lassy){
				if(err) res.send('lassy relationship not found')
				else res.send({result:true, alert:alertDoc, lassy:lassy});
			})

		})*/
	}else{
		res.send("cant find alert")
	}
}

/*
* POST /m/alert/:id/escalate
* Needs token in order to escalate

exports.escalate = function(req, res)
{
	var alertId = req.params.id
	, token = req.param('token', false)
	, _MSG = "Parent need help finding ";
	
	if(alertId && token)
	{
		//token verification logic will be the first thing, for now continue

		Alert.findOne({_id:alertId}, function(err, alert){
			if(err) res.send({result:false, error:'could not locate alert'});
			console.log(alertId);
			Lassy.findOne({_id:alert.lassyID}, function(err, lassy)
			{
				var notifiers = lassy.notifiers;
				_MSG += lassy.name + ", please notify me asap";
				//async
				async.forEach(notifiers, function(nUser, cb){
					twilio.sendSMS({to:'+1'+nUser.mobile.replace('-',''), message:_MSG}, function(errs, result){     
          				if(errs) console.log('Could not send text to user');
          				else console.log('User has been notified');
          				cb();
        			})
				}, function(err){
					res.send({result:true})
				})
				
			})
		})
	}else{
		res.send({result:false, error:'Missing parameters'})
	}
}*/

/*
* POST /m/alert/:id/reply
*/
exports.reply = function(req, res)
{
	var alertId = req.params.id,
		msg = req.param('msg', false);
	res.render('alerts/reply', {});
	/*if(alertId && msg)
	{
		//token verification logic will be the first thing, for now continue

		Alert.findOne({_id:alertId}, function(err, alert){
			if(err) res.send({result:false, error:'could not locate alert'});

			Lassy.findOne({_id:alert.lassyID}, function(err, lassy)
			{
				if(err) res.send({result:false, error:'could not locate lassy'});
				User.findOne({_id:lassy.userID}, function(err, guardian)
				{
					if(err) res.send({result:false, error:'could not locate user'});
					twilio.sendSMS({to:'+1'+guardian.mobile_number.replace('-',''), message:msg}, function(errs, result){     
          				if(errs) console.log('Could not send text to user');
          				else console.log('User has been notified');          				
        			})

				})				
			})
		})
	}else{
		res.send({result:false, error:'Missing parameters'})
	}*/
}

/*
* POST /m/alert/:id/status
*/
exports.status = function(req, res)
{
	var alertId = req.params.id,
		status = req.param('status', false);

	if(alertId && status)
	{
		if(status == "open" || status == "closed" || status == "pending")
		{
			Alert.findOne({_id:alertId}, function(err, alert){
				if(err) return res.send({result:false, error:'could not find alert'});
				alert.status = status;
				alert.save(function(){
					res.send({result:true})
				})
			});
		}else{
			res.send({result:false, error: 'Invalid parameters'})
		}		
	}else{
		res.send({result:false, error: 'Invalid parameters'})
	}
}

