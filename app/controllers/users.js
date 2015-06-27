
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , fs = require('fs')
  , User = mongoose.model('User')
  , Lassy = mongoose.model('Lassy')
  , Zone = mongoose.model('Zone')
  , check = require('validator').check
  , sanitize = require('validator').sanitize
  , twilio = require('../../config/middlewares/twilio')
  , config = require('../../config/config')
  , stripe = require('stripe')(config.development.stripeApiKey)


exports.guests = function(req, res)
{
  res.render('main', {user: req.user})
}

exports.signin = function (req, res) {}

/**
 * Auth callback
 */

exports.authCallback = function (req, res, next) {
  res.redirect('/')
}

/**
 * Show login form
 */

exports.login = function (req, res) {
  res.render('users/login', {
    title: 'Login',
    message: req.flash('error')
  })
}

/**
 * Show sign up form
 */

exports.signup = function (req, res) {
  res.render('users/signup', {
    title: 'Sign up',
    user: new User()
  })
}

/**
 * Logout
 */

exports.logout = function (req, res) {
  req.logout()
  res.redirect('/login')
}

/**
 * Session
 */

exports.session = function (req, res) {
  res.redirect('/user/dashboard')
}

/**
 * Choose Plan
 */

exports.chooseplan = function (req, res) {
  res.render('users/chooseplan', {
    title: 'Choose Plan'
  })
}

/*
*
*/
exports.plan = function(req, res)
{
  var stripeToken = req.param('stripeToken', false)
    , plan = req.param('plan',false)

  if(req.user && stripeToken && plan)
  {
    var stripePayload = {
      card:stripeToken,
      email:req.user.email,
      plan: plan
    }
    //we have a token but is it legit?
    stripe.customers.create(stripePayload, function(err, stripeCustomer){
      if(err) {res.send('not good') }
      User.findOne({_id:req.user._id}, function(err, user){
        if(err) res.send('error cant find user');
     
        user.stripeId = stripeCustomer.id;
        user.save(function()
        {
          //redirect to
          res.redirect('/lassy');
        })
      })
    })
  }else{
    res.send('missing information')
  } 
}

/**
 * Create user HTTP POST
 */

exports.create = function (req, res) {
  var user = new User()
  ,mobile_number = req.param('mobile', '')
  ,password = req.param('pass', '')
  ,zip = req.param('zip', '')
  

 
   
   //function to handle the lookup/creation/update
   var cb = function(err, userfound){
      //if user is found:
        //activated, then tell them number already registered with the village
        //not activated, update the other details and send them to activation page after sending an sms
        //not found, then go ahead as new user
      if(userfound){
          //set to newly found user
          if(!userfound.active)
            user = userfound
          else
            return res.render("users/signup", {errors:[{type:'Mobile number already registered'}]})
      }
      console.log("user after checked %j", user)
      user.mobile = mobile_number
      user.password = password
      user.zip = zip
      user.activation_code = user.createActivationCode() //Math.round(((new Date().valueOf()/1000) * Math.random())) + ''
    
      user.save(function (err) {
        if (err) {
          if(err.name == 'ValidationError')
          {
            return res.render('users/signup', { errors: err.errors, user: user })
          }else if(err.name == 'MongoError') {
            if(err.code == 11000) err.errors = [{type:'Mobile number already registered'}];
    
             return res.render('users/signup', { errors: err.errors, user: user })
          }      
        }
    
        //saved to db so lets send a sms to user
        twilio.sendActivationSMS({to:'+1'+user.mobile_number.replace('-',''), activation:user.activation_code}, function(errs, result){
          if(errs) console.log(errs);    
    
          var encNumber = new Buffer(user.mobile_number).toString('base64');
          return res.redirect('/activate/'+encNumber);
    
        })
    
        
      })    
  }
  
   console.log("user before anything checked" + user.toString())
   if(mobile_number)
    {           
      User.findOne({'mobile_number':mobile_number}, cb);
    }

    
  
}

/**
* Show Activation Window
**/

exports.activate = function(req, res){
  if(req.params.hasOwnProperty('phone'))
  {
    var clean_phone = sanitize(req.params.phone).xss();
    clean_phone = new Buffer(clean_phone, 'base64').toString('ascii');
    return res.render('users/activate', {phone:clean_phone, error:req.param('e'), ph: req.params.phone})
  }  
}

/**
* HTTP POST
* Handles activation checking
**/

exports.doactivation = function(req, res){
  var phone = req.param('mobile', false),
    ph = req.param('ph', false),
    name = req.param('name', false),
    email = req.param('email', false),
    code = req.param('code', false);

    if(phone && code && email && name && ph)
    {
      try{
        check(email).len(6, 64).isEmail()
      }catch(e){
        return res.redirect('activate/'+ph+"?e=E409");
      }     

      var cb = function(err, user)
      {
        if(err || !user) return res.redirect('activate/'+ph+"?e=E409"); 

        user.active = true;
        user.email = email;
        user.name = name;
        user.activation_code = "";      

        user.save(function(er){
          if(er) return res.redirect('activate/'+ph+"?e=E409");    

          req.logIn(user, function(err) {            
            return res.redirect('/user/dashboard')
          })

        })
      }
      
      User.findOne({'mobile_number':phone, 'activation_code': code, 'active':false}, cb);

    }else{
      return res.redirect('activate/'+ph+"?e=409");
    }


}

/**
 *  Show profile
 */

exports.show = function (req, res) {
  var user = req.user
  res.render('users/show', {
    title: user.name,
    user: user
  })
}

/**
 *  User Dashboard
 */
exports.dashboard = function(req, res)
{
  var user = req.user
  Lassy.find({userID:user._id},function(err, records){
	res.render('users/dashboard', {user: user, lassies: records});  
  })
  
}

/**
 *  handles activation code resend
 */
exports.resend = function(req, res){
  var mobile = req.param('mobile', false)
  var mobile_old = req.param('mobileoriginal', false)//get initial mobile num value for lookup
  /*var encNumber = new Buffer(mobile_old).toString('base64');
  var clean_phone = sanitize(mobile_old).xss();
  clean_phone = new Buffer(clean_phone, 'base64').toString('ascii');
  */
  //console.log(mobile_old)
  if(!mobile_old)
    res.redirect('/')
    
  User.findOne({'mobile_number':mobile_old, 'active':false}, function(err, user){
    //if(err) return res.redirect('/activate/'+encNumber+'?e=404'); //shouldnt happen, then dont handle it yet
    if(!user) return res.redirect('/?e=quixotic');//should start over, cause this shouldnt happen
    
    //update old number with new number
    user.mobile_number = mobile;    
    //update new activation code (need to do this to prevent signing up others. it is now a shared secret between different phones if its not changed)
    user.activation_code = user.createActivationCode();
    //save 
    user.save(function(){
        //console.log(user);
        var encNumber = new Buffer(user.mobile_number).toString('base64');
        //updated in the database now send a text message out with new activation code, possibly to a new number
        twilio.sendActivationSMS({to:'+1'+user.mobile_number.replace('-',''), activation:user.activation_code}, function(errs, result){     
          return res.redirect('/activate/'+encNumber);
        })
    })

  })
}



