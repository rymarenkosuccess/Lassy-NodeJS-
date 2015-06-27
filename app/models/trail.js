
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

/**
 * TrailSchema Schema
 */

var TrailSchema = new Schema({
  alertID: {type: Schema.Types.ObjectId, ref:'Alert'}, 
  timestamp:{type: Date, default: Date.now},
  battery: {type: Number},
  coors: {type:[Number], index:"2d"}
});

mongoose.model('Trail', TrailSchema);
