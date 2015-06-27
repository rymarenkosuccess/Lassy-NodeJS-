
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , _ = require('underscore')
/**
 * Route Schema
 */


var RouteSchema = new Schema({
  lassyID:{type:Schema.Types.ObjectId, ref:'Lassy'},
  start: {type: Schema.Types.ObjectId}, //Zone ID
  end: {type: Schema.Types.ObjectId}, //Zone ID
  points: {
  	type:{ type:String }
  	, coordinates: []
  }, //array items position defines path. 0 index represent start, points.length-1 represent end.
  created: {type: Date, default: Date.now},
  name:{type:String},
  distance:{type:Number}
});
RouteSchema.index({ points: '2dsphere' });


/**
 * Virtuals
 */


/**
 * Validations
 */


/**
 * Pre-save hook
 */


/**
 * Methods
 */

RouteSchema.methods = {

}

mongoose.model('Route', RouteSchema)
