
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Imager = require('imager')
  , Route = mongoose.model('Route')
  , async = require('async')
  , _ = require('underscore')

exports.index = function(req, res)
{
	res.render('main', {user: req.user})
}
exports.list = function(req, res){
	var lid = req.param('id', false);
	if(lid)
	{
		Route.find({lassyID:lid},function(err, records){
			if(err)
			{
				res.send({success:false})
			}else{
				res.send({success:true, routes:records})
			}
		})
	}else{
		res.send({success:false, error:'Missing params'});
	}	
}

exports.create = function(req, res){
	var route = new Route();

	//validate all of these on route model
	route.lassyID = req.params.id;
	route.points = JSON.parse(req.param('points', {}));
	route.name = req.param('name', '');
	route.distance = req.param('distance', 0);

	console.log(req.body);

	route.save(function (err, obj) {
		if(!err){
			res.send({success:true, id:obj.id})
		} else {
			res.send({success:false, error:err})
		}
	})
}

exports.show = function(req, res){
	var rid= req.params.rid
	console.log(rid);
	Route.findById(rid, function (err, route) {
		if(!err) {
			console.log(route)
		} else {
			console.log(err)
		}
	})
}

exports.update = function(req, res){
	var rid= req.params.rid
	console.log(rid);
	Route.findById(rid, function (err, route) {
		if(!err) {
			/*route.start = req.param('start', '');
			route.end = req.param('end', '');*/
			route.points = JSON.parse(req.param('points', {}));
			route.save(function (err, obj) {
				if(!err){
					res.send({success:true})
				} else {
					res.send({success:false})
				}
			})
		} else {
			res.send({success:false})
		}
	})
}

exports.remove = function(req, res){
	var rid= req.params.rid
	Route.remove({_id: rid}, function (err) {
		if(!err) {
			res.send({success:true})
		} else {
			res.send({success:false})
		}
	})
}