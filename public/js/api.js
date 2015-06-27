(function(window) {
  var self = this;
  var endpoint = '/lassy/' + window.lid;
  var format = 'json';

  function parseParams(params, template) {
    var query = template;
    // turn cache ON in IE Browser
    $.browser.msie && $.extend(params, {'_':new Date().getTime()});
    for(var key in params){
      query = (query == '?' || query == '') ? query : query + "&";
      query = query + key + '=' + params[key];
    }
    return query;
  }

  function list (model, params, callback) {
    var query = '?';
    query = parseParams(params, query);

    execute(endpoint + '/' + model + query, 'get', '',
      function (res, status, req){
        callback(req.status, res);
      },
      function (req, status, err){
        callback(req.status, err);
    });
  }

  function show (model, params, callback) {
    var id = params.id;
    delete params.id;
    var query = '?';
    query = parseParams(params, query);

    console.log(query);

    execute(endpoint + '/' + model + '/' + id + query, 'get', '',
      function (res, status, req){
        callback(req.status, res);
      },
      function (req, status, err){
        callback(req.status, err);
    });
  }

  function create (model, params, callback) {
    var data = '';
    data = parseParams(params, data);
    console.log(data);


    execute(endpoint + '/' + model + '/' , 'post', data,
      function (res, status, req){
        callback(req.status, res);
      },
      function (req, status, err){
        callback(req.status, err);
    });
  }

  function change (model, params, callback) {
    var id = params.id;
    delete params.id;
    var data = '';
    data = parseParams(params.data, data);
    alert(data);

    execute(endpoint + '/' + model + '/' + id + '/', 'put', data,
      function (res, status, req){
        callback(req.status, res);
      },
      function (req, status, err){
        callback(req.status, err);
    });
  }

  function destroy (model, params, callback) {
    var id = params.id;
    delete params.id;
    var data = '';
    data = parseParams(params, data);
    execute(endpoint + '/' + model + '/' + id, 'delete', data,
      function (res, status, req){
        callback(req.status, res);
      },
      function (req, status, err){
        callback(req.status, err);
    });
  }

  function view (model, params, callback) {
    // body...
    // var id = params.id;
    // delete params.id;
    // var data = '';
    // data = parseParams(params, data);
    // execute(endpoint + '/' + model + '/' + id, 'delete', data,
    //   function (res, status, req){
    //     callback(req.status, res);
    //   },
    //   function (req, status, err){
    //     callback(req.status, err)
    //   }
    // );
  }

  function execute(url, method, data, success, error) {
    return $.ajax({
      url: url
      , crossDomain: false
      , type: method
      , dataType: format
      , data: data
      , success: success
      , error: error
      , xhrFields: {
        withCredentials: true
      }
      , async: false
      /*, cache: false*/
    });
  };

  window.api = function (interface, model, params, callback) {
    if(interface == 'list'){
      list(model, params, function (status, res) {
        if (status == 'error' || status == 400) {
          callback({error: res});
        } else {
          callback(res);
        }
        var parsedjson = {};
      });
    } else if(interface == 'show'){
      show(model, params, function (status, res) {
        if (status == 'error' || status == 400) {
          callback({error: res});
        } else {
          callback(res);
        }
      });
    } else if(interface == 'view'){

    } else if(interface == 'verify'){
      verify(model, params, function (status, res) {
        if (status == 'error' || status == 400) {
          callback({error: res});
        } else {
          callback(res);
        }
        var parsedjson = {};
      });

    } else if(interface == 'create'){
      create(model, params, function (status, res) {
        if (status == 'error' || status == 400) {
          callback({error: res});
        } else {
          callback(res);
        }
      });
    } else if(interface == 'change'){
      change(model, params, function (status, res) {
        if (status == 'error' || status == 400) {
          callback({error: res});
        } else {
          callback(res);
        }
      });

    } else if(interface == 'destroy'){
      destroy(model, params, function (status, res) {
        if (status == 'error' || status == 400) {
          callback({error: res});
        } else {
          callback(res);
        }
      });
    } else if(interface == 'publish') {
      publish(model, params, function (status, res) {
        if (status == 'error' || status == 400) {
          callback({error: res});
        } else {
          callback(res);
        }
      });
    }
      else {
      return(callback(-1, {error: 'unknown interface'}));
    }

  };

})(this);