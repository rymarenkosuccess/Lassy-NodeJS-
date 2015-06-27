
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , _ = require('underscore')
/**
 * Zone Schema
 */


var ZoneSchema = new Schema({
  name: String,
  position: {
  	type:{type:String},
  	coordinates: []
  },
  created: {type: Date, default: Date.now},
  radius: {type: Number},
  lassyID: {type: Schema.Types.ObjectId, ref: 'Lassy' }
});
ZoneSchema.index({ position: '2dsphere' });

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

ZoneSchema.methods = {

}

mongoose.model('Zone', ZoneSchema)
