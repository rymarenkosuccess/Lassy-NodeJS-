
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , _ = require('underscore')
/**
 * Route Schema
 */


var AlertSchema = new Schema({
  lassyID: {type: Schema.Types.ObjectId, ref:'Lassy'}, 
  userID: {type: Schema.Types.ObjectId, ref:'User'},
  status: {type:String},  
  posted: {type: Date, default: Date.now},
  token: {type:String}
});


mongoose.model('Alert', AlertSchema)
