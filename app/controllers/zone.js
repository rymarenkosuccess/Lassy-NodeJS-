
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Imager = require('imager')
  , Lassy = mongoose.model('Lassy')
  , Zone = mongoose.model('Zone')
  , async = require('async')
  , _ = require('underscore')

exports.index = function(req, res)
{
	res.render('main', {user: req.user})
}
exports.list = function(req, res){
	var lid = req.param('id', false); //lassy id
	Zone.find({},function(err, records){
		res.send(records)
	})
}

exports.create = function(req, res){
	var zone = new Zone()
	zone.name = req.param('zonename', '');
	zone.lassyID = req.param('lassy_id', '');
	zone.position = {
		type: "Point",
		coordinates: [parseFloat(req.param('lng', '')), parseFloat(req.param('lat', ''))]
	};
	zone.radius = 100;
	zone.save(function (err, obj) {
		if(!err){
			res.send({success:true, id:zone._id})
		} else {
			res.send({success:false})
		}
	})
}

exports.show = function(req, res){
	var zid= req.params.zid
	Zone.findById(zid, function (err, zones) {
		if(!err) {
			res.send({success:true, data:zones});
		} else {
			res.send({success:false, data:[]});
		}
	})
}

exports.update = function(req, res){
	var zid= req.params.zid;
	Zone.findById(zid, function (err, zones) {
		if(!err) {
			zones.name = req.param('name', '');			
			zones.radius = req.param('radius', 100);
			zones.save(function (err, obj) {
				if(!err){
					res.send({success:true})
				} else {
					res.send({success:false})
				}
			})
		} else {
			res.send({success:true})
		}
	})
}

exports.remove = function(req, res){
	var zid= req.params.zid
	Zone.remove({_id: zid}, function (err) {
		if(!err) {
			res.send({success:true})
		} else {
			res.send({success:false})
		}

	})
}