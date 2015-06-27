
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Imager = require('imager')
  , Lassy = mongoose.model('Lassy')
  , async = require('async')
  , _ = require('underscore')

exports.list = function(req, res){
	var id= req.params.id
	Lassy.findById(id,function(err, records){
		if(err) res.send({success:false});
		else res.send({success:true, contacts:records.notifiers})		
	})
}

exports.create = function(req, res){
	var id= req.params.id;
	var contact = {
		name: req.param('name', ''),
		mobile: '+1'+req.param('mobile', '').replace(/-/g,'')
	}	
	Lassy.findOne({'_id': id}, function(err, lassy){
		if(err) 
		{
			res.send({success:false}, 404);
			alert('ok');
		}else{
			lassy.notifiers.push(contact);
			var doc = lassy.notifiers[lassy.notifiers.length-1];
			lassy.save(function(err){
				if(err) res.send({success:false}, 404);
				else res.send({_id:doc._id});
			})
			
		} 
	})
	
}

exports.update = function(req, res){
	var nid= req.params.nid
	var contact = {
		'notifiers.$.name': req.param('name', ''), 
		'notifiers.$.mobile': '+1'+req.param('mobile', '').replace(/-/g,'')
	}
	Lassy.update({'notifiers._id': nid}, {$set: contact},  function(err, obj){
		if(err) res.send({success:false});
		else res.send({})
	})
}

exports.remove = function(req, res){
	var nid= req.params.nid
	, id = req.params.id
	Lassy.update({'_id': id}, {$pull: {notifiers: {_id: nid}}},  function(err, obj){
		if(err) res.send({success:false});
		else res.send({success:true})
	})
}

exports.delete = function(req, res){
	var id = req.params.nid
	, id = req.params.id
	Lassy.update({'_id': id}, {$pull: {notifiers: {_id: nid}}}, function(err, obj){
		if (err) res.send({success:false});
		else res.send({success:true})
	})
}

