
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , _ = require('underscore')
  , authTypes = ['twitter', 'facebook'];
/**
 * User Schema
 */


var UserSchema = new Schema({
  name: String,
  mobile_number:  {type: String, index:{unique:true}},
  zip: String,
  email:   String,
  hashed_password: String,
  active: {type: Boolean, default: false},
  activation_code: String,
  plan_id: String,
  stripeId: String,
  salt: String,
  updated: { type: Date, default: Date.now },
  role: Number, //Notifier or Regular user
});


/**
 * Virtuals
 */

UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function() { return this._password })

UserSchema
  .virtual('mobile')
  .set(function(mobile) {
    this._mobile = mobile
    this.mobile_number = mobile.replace(/-/g, "");
  })
  .get(function() { return this._mobile })

/**
 * Validations
 */

var validatePresenceOf = function (value) {
  return value && value.length
}

// the below 4 validations only apply if you are signing up traditionally

UserSchema.path('mobile_number').validate(function (mobile_number) {
  // if you are authenticating by any of the oauth strategies, don't validate
  //if (authTypes.indexOf(this.provider) !== -1) return true
  return mobile_number.length
}, 'Mobile cannot be blank')


UserSchema.path('hashed_password').validate(function (hashed_password) {
  // if you are authenticating by any of the oauth strategies, don't validate
  //if (authTypes.indexOf(this.provider) !== -1) return true
  return hashed_password.length
}, 'Password cannot be blank')

UserSchema.path('zip').validate(function (zip) {
  // if you are authenticating by any of the oauth strategies, don't validate
  //if (authTypes.indexOf(this.provider) !== -1) return true
  return zip.length
}, 'Zip Code cannot be blank')


/**
 * Pre-save hook
 */

UserSchema.pre('save', function(next) {
  if (!this.isNew) return next()

  if (!validatePresenceOf(this.password))
  {
     next(new Error('Invalid password'))
   }else{     
      next()
   }
   
  
})

/**
 * Methods
 */

UserSchema.methods = {

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */

  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password
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
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */

  encryptPassword: function(password) {
    if (!password) return ''
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex')
  },

  /**
  * Make Activation Code
  *
  * @return {String} activation_code
  *@api public
  */
  createActivationCode: function()
  {
    return Math.round(((new Date().valueOf()/1000) * Math.random())).toString().substring(0,4)
  }
}

mongoose.model('User', UserSchema)
