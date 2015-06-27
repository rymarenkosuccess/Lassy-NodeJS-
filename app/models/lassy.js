
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , _ = require('underscore')
  , crypto = require('crypto');


var DeviceSchema = new Schema({
  deviceID:String,
  secret:String,
  salt:String,
  accessToken:String
});
/**
 * Lassy Schema
 */
var LassySchema = new Schema({
  userID: Schema.Types.ObjectId,
  name: {type: String, index: true},
  stats:  {
    age: { type: Number, min: 1, max: 21 },
    height: String,
    weight: String,
    haircolor: String,
    eyecolor: String,
    gender: String,
    medical_conditions:String
  },
  photo: {type: String}, //url of photo
  zones: [{type: Schema.Types.ObjectId, ref: 'Zone' }],
  routes:[{type: Schema.Types.ObjectId, ref: 'Route' }],
  device: {
    deviceID:String,
    secret:String,
    salt:String,
    accessToken:String
  }, 
  notifiers:[{name:String, mobile:String}]
});

/**
 * Virtuals
 */
 
 /*
LassySchema
  .virtual('device_secret')
  .set(function(secret) {
    this._dSecret = secret
    console.log(this);
    this.device.salt = this.makeSalt()
    this.device.secret = this.encryptSecret(secret)
  })
  .get(function() { return this._dSecret });
*/

/**
 * Validations
*/

LassySchema.path('name').validate(function (name) {
  return name.length
}, 'Name cannot be blank')
LassySchema.path('stats.age').validate(function (age) {
  return age > 0
}, 'Age cannot be blank')
LassySchema.path('stats.height').validate(function (height) {
  return height.length
}, 'Height cannot be blank')

LassySchema.path('stats.weight').validate(function (weight) {
  return weight.length
}, 'Weight cannot be blank')

LassySchema.path('stats.haircolor').validate(function (haircolor) {
  return haircolor.length
}, 'Hair color cannot be blank')

LassySchema.path('stats.eyecolor').validate(function (eyecolor) {
  return eyecolor.length
}, 'Eye color cannot be blank')

LassySchema.path('stats.gender').validate(function (gender) {
  return gender.length
}, 'Gender cannot be blank')

LassySchema.path('stats.medical_conditions').validate(function (medical_conditions) {
  return medical_conditions.length
}, 'Medican conditions cannot be blank')
LassySchema.path('photo').validate(function (photo) {
  return photo.length
}, 'Please choose photo')
/**
 * Pre-save hook
 */


/**
 * Methods
 */

LassySchema.methods = {


  checkDevice: function(plainText) {
    return this.encryptSecret(plainText, this.device.salt) === this.device.secret
  },

    /**
   * Make salt
   *
   * @return {String}
   * @api public
   */

  makeSalt: function() {
    return Math.round((new Date().valueOf() * Math.random())) + ''
  },

  /**
   * Encrypt s
   *
   * @param {String} secret
   * @return {String}
   * @api public
   */
  encryptSecret: function(s, salt) {
    if (!s) return ''
    return crypto.createHmac('sha1', salt).update(s).digest('hex')
  },
}

mongoose.model('Lassy', LassySchema)
