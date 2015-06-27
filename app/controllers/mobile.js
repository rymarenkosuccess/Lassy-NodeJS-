/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Lassy = mongoose.model('Lassy')
  , Zone = mongoose.model('Zone')
  , Route = mongoose.model('Route')
  , uuid = require('node-uuid');


/*
* Public authenticator for mobile activation
* @param String mobile_number/device_id
* @param String secret code hashed
* @param String lassy_Id
* @return String access_token
*/
exports.activate = function(req, res)
{
  var id = req.param('deviceID', false)
    , s = req.param('secret', false);    

    //make sure we have all we need before calling the DB (wow that rhythmed)
    if(id && s)
    {
      Lassy.findOne({"device.deviceID":id}, function(err, lassy){
        if(err) return res.send({success:false, error:'Could not find lassy document'});
        if(!lassy) return res.send({success:false});
        if(lassy.checkDevice(s))
        {
          //everything went well authorizacing user so lets make a access token for mobile to use
          lassy.device.accessToken = uuid.v4();
          lassy.save(function(){
            res.send({success:true, accessToken:lassy.device.accessToken, lassyID:lassy._id});
          })
        }else{
          res.send({success:false, error:'Activation Failed. Mobile number and secret mismatch'});
        }

      })
    }else{
      return res.send({success:false, error:'Missing parameters'});
    }
}

/*
* Gather Zone list
* @param String lassyid/device_id
* @param String accesstoken code hashed
* @return Array List of safe zones for mobile to watch out
*/
exports.safezones = function(req, res)
{  
  var token = req.param('accessToken', false)
    , lid = req.param('lassyID', false);

  if(token && lid)
  {
    Lassy.findOne({_id:lid, "device.accessToken":token}, function(err, lassy){
      if(err) res.send({success:false});
      if(!lassy) res.send({success:false});

      res.send({success:true, zones:lassy.zones});

    })
  }else{
    res.send({success:false});
  }

}

/*
* Keep track of coordinates after child goes off course or route
* @param String lassyid/device_id
* @param String accesstoken code hashed
* @param String battery life
* @return Array List of safe zones for mobile to watch out
* @example call
* @url http://localhost:8080/m/current
* @data accessToken=ade000a0-cc89-491b-8bd9-f6434e7c3471&lassyID=519a5afa991be45a2c000002&lat=34.008067&lng=-118.490939
*/
exports.current_pos = function(req, res)
{
  var token = req.param('accessToken', false)
    , lid = req.param('lassyID', false)
    , lat = req.param('lat', false)
    , rad = req.param('radius', 10)
    , lng = req.param('lng', false);

  if(token && lid && lat && lng)
  {
    /* TODO: geospatial on mongo
    1. make sure we are on safe zones just in case
    2. check if user is during a safe route
    3. if all the above is false log current child position until next log is on the safe zone. 
    At this point we are assuming the child is not in a safe zone. So we send out an alert to parent (account holder)
    */
    //lets check if current is within a zone
    Zone.find({
      lassyID:lid, 
      position:{
        "$geoWithin":{
          "$center":[[parseFloat(lng), parseFloat(lat)], parseFloat(rad/69)]
        }
      }
  }, function(err, zones){
    if(zones.length == 0)
    {
      //out of safe zone
      //check if current is on a route
      console.log('NOTSAFE ZONE');
      Route.find({
        lassyID:lid,
        points: {
          "$geoWithin":{
            "$centerSphere":[[parseFloat(lng), parseFloat(lat)], 0.00121822581]
            //---> 0.00757576 miles/ 62.1868289 rad
          }
        }
      }, function(err, routes){

        if(err){
          console.log(err);
          res.send("FALSE")
          return;
        }

        if(routes.length === 0)
        {
           console.log('NOTSAFE ROUTES');
           res.send("NOTSAFE ROUTES")
        }else{
          console.log("SAFE ROUTE");
          res.send("SAFE ROUTES")
        }
      });      
    }else{
      console.log("SAFE ZONE");
      res.send({result:'SAFE'});
    }
    
  })

    
  }else{
    res.send({success:false})
  }

}




















