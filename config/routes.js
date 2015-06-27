
var mongoose = require('mongoose')
  //, Article = mongoose.model('Article')
  , User = mongoose.model('User')
  , async = require('async')
  , https = require('https')
  , querystring = require('querystring');
  

module.exports = function (app, passport, auth) {


  // user routes
  var users = require('../app/controllers/users')
  app.get('/signup', users.signup)
  app.post('/signup', users.create)
  app.get('/activate', users.activate)
  app.get('/activate/:phone', users.activate)
  app.post('/doactivation', users.doactivation)
  app.post('/user/resend', users.resend)
  app.get('/user/show', users.show)
  app.get('/user/dashboard', auth.requiresLogin, users.dashboard)
  app.get('/login', users.login)
  app.get('/logout', users.logout)
  app.post('/users/session', passport.authenticate('local', {failureRedirect: '/login', failureFlash: 'Invalid email or password.'}), users.session)
  
  app.get('/user/chooseplan', users.chooseplan)
  app.post('/user/plan', users.plan)
  
  var lassy = require('../app/controllers/lassy')
  // home route
  app.get('/', users.guests)
  //Lassy
  /*app.get('/lassy/:id', lassy.show)
  app.post('/lassy', lassy.create)
  app.del('/lassy/:id', lassy.remove)*/
  //creating lassy
  app.get('/lassy', lassy.index)
  app.get('/lassy/:id', lassy.index)
  app.post('/lassy/new', lassy.new)
  app.get('/lassy/:id/stats', lassy.getstats)
  app.post('/lassy/stats', lassy.stats)
  app.get('/lassy/picture/:id', lassy.getpicture)
  app.post('/lassy/picture/:id', lassy.picture)
  app.get('/lassy/zone/:id', lassy.getzone)
  app.post('/lassy/zone/:id', lassy.zone)
  app.get('/lassy/routes/:id', lassy.route)
  app.get('/lassy/contacts/:id', lassy.contacts)
  app.get('/lassy/device/:id', lassy.device)
  app.post('/lassy/device/:id/ack', lassy.ackdevice)
  app.get('/lassy/overview/:id', lassy.overview)
  
  var zone = require('../app/controllers/zone')
  //Zone

  app.get('/lassy/:id/zones', zone.list)
  app.get('/lassy/:id/zones/:zid', zone.show)
  app.post('/lassy/:id/zones/', zone.create)  
  app.put('/lassy/:id/zones/:zid', zone.update)
  app.post('/lassy/:id/zones/:zid', zone.update)  
  app.del('/lassy/:id/zones/:zid', zone.remove)
  
  //Route
  var routes = require('../app/controllers/route')
  app.post('/lassy/:id/routes/create', routes.create)
  app.get('/lassy/:id/routes', routes.list)
  app.get('/lassy/:id/routes/:rid', routes.show)
  app.put('/lassy/:id/routes/:rid', routes.update)
  app.del('/lassy/:id/routes/:rid', routes.remove)

  //Notifier
  var notifiers = require('../app/controllers/notifier')
  app.get('/lassy/:id/notifiers', notifiers.list)
  app.post('/lassy/:id/notifiers', notifiers.create)
  app.put('/lassy/:id/notifiers/:nid', notifiers.update)
  app.del('/lassy/:id/notifiers/:nid', notifiers.remove)

  var alerts = require('../app/controllers/alerts')
  app.get('/m/alert/:id', alerts.view)
  app.get('/m/alert/:id/reply', alerts.reply)
  app.get('/m/alert/:id/village', alerts.reply)

  //mobile api endpoint hanlders
  var mobile = require('../app/controllers/mobile')
  app.post('/m/activate', mobile.activate)
  app.get('/m/safezones', mobile.safezones)
  app.post('/m/current', mobile.current_pos)
  
 }