
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , fs = require('fs')
  , Imager = require('imager')
  , Lassy = mongoose.model('Lassy')
  , Zone = mongoose.model('Zone')
  , check = require('validator').check
  , sanitize = require('validator').sanitize
  , twilio = require('../../config/middlewares/twilio')
  , config = require('../../config/config')
  , async = require('async')
  , _ = require('underscore')

exports.index = function(req, res)
{	
	if(req.user.stripeId != "")
	{
		if(req.params.id)
		{
			Lassy.findOne({_id:req.params.id}, function(err, lassy)
			{
				res.render('lassy/whoisitfor', {
	    			title: 'Who is it for',
					name: lassy.name,
					lid: lassy._id
	  			})
			})
		}else{
			res.render('lassy/whoisitfor', {
	    		title: 'Who is it for',
				name: '',
				lid: ''
	  		})
		}
	}else{
		res.redirect('/user/chooseplan')
	}
	
}


/**
 * Who is it for updates and creates
 */
exports.new = function (req, res) {

	var lid = req.param('lid', false);

	if(lid)
	{
		Lassy.findById(lid, function (err, lassy) {
			if(!err) {
				lassy.name = req.param('lassyname');
				lassy.save(function(){
					res.redirect('/lassy/'+lid+'/stats');
				})
			}
		})
	}else{
		var lassy = new Lassy()
		  ,name = req.param('lassyname', '')
		  lassy.name = name;
		  lassy.userID = req.user._id;
		  lassy.save(function (err, obj) {
			  if(!err){
				  res.redirect('/lassy/'+obj._id+'/stats');
			  } else {
		          if(err.name == 'ValidationError')
		          {
		            return res.render('lassy/whoisitfor', { errors: err.errors, name: ''})
		          }
			  }
	 	 })
	}
}
/*
show Lassy home page
*/
exports.edit = function(req, res)
{
	var lid = req.param('lid', false);

	if(lid)
	{
		Lassy.findById(lid, function (err, lassy) {
			if(!err) {
				res.render('lassy/edit', lassy);
			}
		})
	}else{
		res.redirect('user/dashbord');
	}
}
/**
 * Stats
 */
exports.putname = function(req, res) {
	var id= req.params.id
	Lassy.findById(id, function (err, lassy) {
		lassy.name = req.param('buyername', '')
		lassy.save(function (err, obj) {
		  if(!err){
			  res.redirect('lassy/stats/'+id)
		  } else {
			  if(err.name == 'ValidationError')
			  {
				return res.render('lassy/whoisitfor', { errors: err.errors, name: ''})
			  }
		  }
	    })
	})
}

exports.getstats = function (req, res) {
	var id= req.params.id
	Lassy.findById(id, function (err, lassy) {
		if(!err) {
		  res.render('lassy/stats', {
			title: 'Stats',
			id: lassy.id,
			stats: lassy.stats
		  })
		} else {
			console.log(err)
		}
	})
}

exports.stats = function (req, res) {

  var lassy = new Lassy()
  ,name = req.param('buyername', '')
  lassy.name = name;
  lassy.userID = req.user._id;
  lassy.save(function (err, obj) {
	  if(!err){
		  res.render('lassy/stats', {
			title: 'Stats',
			id: obj.id
		  })
	  } else {
          if(err.name == 'ValidationError')
          {
            return res.render('lassy/whoisitfor', { errors: err.errors, name: ''})
          }
	  }
  })
  
}

/**
 * Picture
 */
exports.getpicture = function (req, res) {
	var id= req.params.id
	Lassy.findById(id, function (err, lassy) {
		if(!err) {
			res.render('lassy/picture', {
				title: 'Setup Picture',
				id: id,
				photo: lassy.photo
			})
		} else {
			console.log(err)
		}
	})
}

exports.picture = function (req, res) {
  var id= req.params.id
  var age = req.param('age', '')
  ,height = req.param('height', '')
  ,weight = req.param('weight', '')
  ,hair_color = req.param('hair_color', '')
  ,eye_color = req.param('eye_color', '')
  ,boy_girl = req.param('boy_girl', '')
  ,med_condition = req.param('med_condition', '')
  Lassy.findById(id, function (err, lassyitem){
	  lassyitem.stats.age = age;
	  lassyitem.stats.height = height;
	  lassyitem.stats.weight = weight;
	  lassyitem.stats.haircolor = hair_color;
	  lassyitem.stats.eyecolor = eye_color;
	  lassyitem.stats.gender = boy_girl;
	  lassyitem.stats.medical_conditions = med_condition;	  
	  lassyitem.save(function(err, obj) {
		  if(!err){
			  res.redirect('lassy/picture/'+obj.id)
		  } else {
			  if(err.name == 'ValidationError')
			  {
				return res.render('lassy/stats', { errors: err.errors, id: id})
			  }
		  }
	  })
  })
}

/**
 * Zone
 */
exports.getzone = function (req, res) {
	var id= req.params.id
	var zonelist = []
	Lassy.findById(id, function (err, lassyitem){
		var zoneids = lassyitem.zones
		if(zoneids.length > 0) {
			Zone.find({'_id': {$in: zoneids}}, function (err, zoneitems) {
				res.render('lassy/zone', {
					title: 'Setup Zone',
					id: id,
					zones: zoneitems
				});
			})
		} else {
			res.render('lassy/zone', {
				title: 'Setup Zone',
				id: id
			});
		}

	})
}

exports.zone = function (req, res) {
	var id= req.params.id
     var tmp_path = req.files.photo.path;
    // set where the file should actually exists - in this case it is in the "images" directory
	if(req.files.photo.name != ''){
		var target_path = './public/child-images/' + req.files.photo.name;
		// move the file from the temporary location to the intended location
		fs.rename(tmp_path, target_path, function(err) {
			if (err) throw err;
			// delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
			fs.unlink(tmp_path, function() {
				if (err) throw err;
				Lassy.findById(id, function (err, lassyitem){
				  lassyitem.photo = req.files.photo.name;
				  lassyitem.save(function(err, obj) {
					  if(!err){
						  res.redirect('lassy/zone/'+id)
					  }else {
						  return res.render('lassy/picture', { errors: err.errors, id: id})
					  }
				  });
			  });
			});
		});
	} else {
		return res.render('lassy/picture', {err:"Please choose photo.", id: id})
    }
}

/**
 * Route
 */

exports.route = function (req, res) {
	
  var id= req.params.id;

  Lassy.findOne({_id:id}, function(err, lassy){
  	if(err) res.redirect('/');
  	res.render('lassy/route', {
		title: 'Setup Route',
		lassy: lassy,
		id:id
	});
  })
}

/**
 * Contacts
 */
exports.contacts = function (req, res) {
	var id= req.params.id
	Lassy.findById(id,function(err, records){
		res.render('lassy/contacts', {
			title: 'Setup Contacts',
			id: id
		})
	})
}

exports.device = function(req, res)
{
	var id= req.params.id
	Lassy.findById(id,function(err, records){
		res.render('lassy/device', {
			title: 'Setup Device',
			id: id			
		})
	})
}

exports.ackdevice = function(req, res)
{
	var id= req.params.id,
		secret = req.param('secret', false),
		mobile = req.param('mobile', false);

	if(secret && mobile && id)
	{
		Lassy.findOne({_id:id}, function(err, lassy){
			var d = {
				deviceID: mobile,
				salt: lassy.makeSalt()
			}
			d.secret = lassy.encryptSecret(secret, d.salt);
			lassy.device = d;
			lassy.save(function(err){
				if(err)
				{
					res.render('lassy/device', {
						title: 'Setup Device',
						id: id,
						error:'Could not send link'			
					})
				}else{
					//send text message to mobile with mobile link
					res.redirect('/lassy/overview/'+id)
				}
			})
		})
	}else{
		res.send('FAILED')
	}

	
}

exports.finish = function (req, res) {
  var id= req.params.id
  var contact_count = req.param('contact_count', '');
  var notifiers = [];
  if(contact_count > 0) {
	for(i=1; i< contact_count; i++)	{
		var notifier = {user_id:id, name:req.param('contactname-'+i, ''), mobile:parseInt(req.param('contactnum-'+i, '').replace(/\-/g, ''))};
		notifiers.push(notifier);
		
	}
    Lassy.findById(id, function (err, lassyitem){
	  lassyitem.notifiers = notifiers;
	  lassyitem.save(function(err, obj) {
		  res.redirect('/lassy/overview/'+id);
	  });
    });
  } else {
	return res.render('lassy/contacts', {err:"Please input contact information.", id: id})
  }
}

exports.overview = function(req, res) {
	var id = req.params.id;
	Lassy.findById(id).populate('zones').exec(function(err, lassyitem) {
		var photo = lassyitem.photo;
		var name = lassyitem.name;
		var notifiers = lassyitem.notifiers;
		var stats = lassyitem.stats;
		var routes = lassyitem.routes;
		var zones = lassyitem.zones;
		res.render('lassy/overview', {id: id, photo:photo, name: name, notifiers:notifiers, stats:stats, routes: routes, zones: zones});
	});
	
}

exports.show = function(req, res){
	var id= req.params.id
	Lassy.findById(id, function (err, lassy) {
		if(!err) {
			console.log(lassy)
		} else {
			console.log(err)
		}
	})
}

exports.create = function(req, res){
	var lassy = new Lassy()
	,name = req.param('buyername', '')
	lassy.name = name
	lassy.save(function (err, obj) {
		if(!err){
			console.log(obj.id)
		} else {
			console.log(err)
		}
	})
}

exports.remove = function(req, res){
	var id= req.params.id
	Lassy.remove({_id: id}, function (err) {
		if(!err) {
			console.log('Success')
		} else {
			console.log(err)
		}

	})
}