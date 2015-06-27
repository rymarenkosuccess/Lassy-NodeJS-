(function(window) {
	var $ = window.$,
		L = window.L,
		_ = window._,
		map = window.map,
		zoneVM = window.zoneVM;

	var drawPolyLine;

	var layerToGeometry = function(layer) {
	    var json, type, latlng, latlngs = [], i;

	    if (L.Marker && (layer instanceof L.Marker)) {
	        type = 'Point';
	        latlng = LatLngToCoords(layer._latlng);
	        return JSON.stringify({"type": type, "coordinates": latlng});

	    } else if (L.Polygon && (layer instanceof L.Polygon)) {
	        type = 'Polygon';
	        latlngs = LatLngsToCoords(layer._latlngs, 1);
	        return JSON.stringify({"type": type, "coordinates": [latlngs]});

	    } else if (L.Polyline && (layer instanceof L.Polyline)) {
	        type = 'LineString';
	        latlngs = LatLngsToCoords(layer._latlngs);
	        return JSON.stringify({"type": type, "coordinates": latlngs});

	    }
	}

	var LatLngToCoords = function (LatLng, reverse) { // (LatLng, Boolean) -> Array
	    var lat = parseFloat(reverse ? LatLng.lng : LatLng.lat),
	        lng = parseFloat(reverse ? LatLng.lat : LatLng.lng);

	    return [lng,lat];
	}

	var LatLngsToCoords = function (LatLngs, levelsDeep, reverse) { // (LatLngs, Number, Boolean) -> Array
	    var coord,
	        coords = [],
	        i, len;

	    for (i = 0, len = LatLngs.length; i < len; i++) {
	        coord = levelsDeep ?
	                LatLngToCoords(LatLngs[i], levelsDeep - 1, reverse) :
	                LatLngToCoords(LatLngs[i], reverse);
	        coords.push(coord);
	    }

	    return coords;
	}

	var geometryToLayer = function (layer_type, data) {
		if (layer_type == 'polyline') {
			var latlngs = [];
			if (!Array.isArray(data))
				throw "2nd Parameter has to be array of coordinates";
			for (var idx = 0; idx < data.length; idx++) {
				latlngs.push(new L.LatLng(data[idx][1], data[idx][0]));
			}
			return new L.Polyline(latlngs);
		}
	}

	function RouteModel(data) {
		data = data || {};
		this.id = ko.observable(data._id || (new Date()).getTime());
		this.name = ko.observable(data.name || '');
		this.polyline = ko.observable();
		if (data.points && data.points.coordinates) {
			var polyline_layer = geometryToLayer('polyline', data.points.coordinates);
			this.polyline(polyline_layer);
		}
		this.srcZone = ko.observable();
		this.dstZone = ko.observable();
		this.distance = ko.observable(data.distance || '');
		this.status = ko.observable('normal');
	}
	function Route() {
		this.routes = ko.observableArray();
		this.add_mode = ko.observable(false);
		this.edit_mode = ko.observable(false);
		this.notification = ko.observable('');

		this.edit_mode.subscribe(function (mode) {
			if (mode)
				this.notification('Please click the above [Save] button to stop modify');
			else
				this.notification('');
		}, this);
		this.add_mode.subscribe(function (mode) {
			if (mode)
				this.notification('Select the zone to create route');
			else
				this.notification('');
		}, this);
		this.selected_routeID = ko.observable(-1);
	}

	

	Route.prototype.loadRoutes = function () {

	
  		//L.geoJson(testRoutes, {style: {color: '#000000', weight:5, fillColor:'#000'}}).addTo(map);		

  		/*
  		var coorsField = {
		    "type": "Feature",
		    "properties": {
		        "popupContent": "Route"
		    },
		    "geometry": {
		        "type": "LineString",
		        "coordinates": [
		        	[-118.4618, 34.015388], [-118.446007, 33.997031],
		        	[-118.446007,33.997031], [-118.470039, 33.98536]
		        ]
		    }
		};
		*/
		//L.geoJson(coorsField, {style: {color: '#000000', weight:5, fillColor:'#000'}}).addTo(map);		

		
		var self = this;
		self.routes.removeAll();
		api('list', 'routes', {}, function (data) {
			if (!data.success) {
				alert('zone Loading error');
				return ;
			}

			if(data.routes.length === 0) {
				alert('Empty!');
				return ;
			}

			var routesLayer = [];

			for(var i=0,len=data.routes.length; i<len; i++)
			{
				var rObj = data.routes[i];
				/*var f = {
					type: "Feature",
					properties: {},
					geometry: rObj.points
				}
				routesLayer.push(f);*/
				var m = new RouteModel(rObj)
				self.routes.push(m);
				map.addLayer(m.polyline());
			}

			/*L.geoJson(routesLayer, {style: {color: '#23b3ed', weight:7,opacity:0.8}}).addTo(map);	*/
		});
		
	}

	Route.prototype.get = function (routeID) {
		var routes = this.routes();
		return _.find(routes, function (route) {
			return route.id() == routeID;
		});
	}
	Route.prototype.createRoute = function (e) {

		var route = new RouteModel();
		var zones = zoneVM.zones();
		route.name('[New Route]');
		this.add_mode(true);
		this.routes.push(route);
		for (var idx = 0, len = zones.length; idx<len; idx++) {
			(function(marker, rVM){
				marker.on('click', rVM._setSrcZone, rVM);
			})(zones[idx].marker, this);
		}
		return false;
	}
	Route.prototype.cancelCreate = function () {
		
		/*var zones = zoneVM.zones();*/
		this._removeZoneHandler(this._setSrcZone);
		this.routes.pop();
		if (drawPolyLine) {
			drawPolyLine.removeHooks();
			delete drawPolyLine;
		}
		this.add_mode(false);
	}
	Route.prototype.modifySave = function () {
		var routes = this.routes();
		_.each(routes, function (route, idx) {
			route.polyline().editing.disable();
			console.log(route.polyline().editing);
		});
		//call convert to geoJSON
		var selected_routeID = this.selected_routeID()
		  , selected_route = this.get(selected_routeID);
		var geoj = layerToGeometry(selected_route.polyline());
		

		api('change','routes', {id:selected_routeID, data:{points:geoj}}, function(resp){
			if (!resp.success)
				alert('route create fail');
			console.log(resp);
		});
		this.edit_mode(false);
		this.selected_routeID(-1);
	}
	
	
	Route.prototype._setSrcZone = function (e) {
		var marker = e.target;
		var srcZone = marker._zone;
		var routes = this.routes();
		var selRoute = routes[routes.length-1];

		drawPolyLine = new L.Draw.Polyline(map, {title: 'title goes here'});
		selRoute.srcZone(srcZone);
		selRoute.name(srcZone.name() + " - ");
		drawPolyLine.addHooks.call(drawPolyLine); 
		drawPolyLine._onClick.call(drawPolyLine, e);
		this._removeZoneHandler(this._setSrcZone);
		this._setDstZoneHandler(srcZone);
	}
	Route.prototype._removeZoneHandler = function (handler) {
		var zones = zoneVM.zones();
		for (var idx = 0, len = zones.length; idx<len; idx++) {
			zones[idx].marker.off('click', handler, this);
		}
	}
	Route.prototype._setDstZoneHandler = function (srcZone) {
		var self = this;
		var zones = zoneVM.zones();
		for (var idx = 0, len = zones.length; idx<len; idx++) {
			if (zones[idx].id !== srcZone.id) {
				zones[idx].marker.on('click', this._endRouteDraw, this);
			}
		}
	}
	Route.prototype._endRouteDraw = function (e) {
		var marker = e.target;
		var dstZone = marker._zone;
		var routes = this.routes();
		var selRoute = routes[routes.length-1];

		selRoute.dstZone(dstZone);
		selRoute.name(selRoute.name() + dstZone.name());
		drawPolyLine._onClick.call(drawPolyLine, e);
		drawPolyLine._finishShape();
		this._removeZoneHandler(this._endRouteDraw);
		this.add_mode(false);		
	}
	Route.prototype.addPolyLineToRoute = function (layer, distance) {
		var routes = this.routes();
		var selRoute = routes[routes.length-1];
		selRoute.polyline(layer);
		selRoute.distance(distance);

		//call convert to geoJSON
		var geoj = layerToGeometry(layer);

		var payload = {
			name:selRoute.name(),
			distance:selRoute.distance(),
			points: geoj
		}

		api('create','routes/create', payload, function(resp){
			if (!resp.success)
				alert('route create fail');
			else
				selRoute.id(resp.id);
			console.log(resp);
		})

		map.addLayer(layer);
	}
	Route.prototype.editEnable = function (route) {
		route.polyline().edit.enable();
	}
	Route.prototype.delAssocWithZone = function () {

	}
	Route.prototype.remove = function (routeID) {
		var self = this;
		api('destroy', 'routes', {id:routeID}, function(resp){
			if(!resp.success) {
				alert('error while deleting route');
			} else {
				self.routes.remove(function(route) {
					if (route.id() == routeID){
						var poly = route.polyline();
						map.removeLayer(poly);
						delete poly;
						return true;
					} else {
						return false;
					}
				});
			}
		});
	}
	var m_route = new Route();
	map.on('draw:created', function (e) {
		var type = e.layerType,
	        layer = e.layer;
		if (type == 'polyline') {
			m_route.addPolyLineToRoute(layer, parseFloat(drawPolyLine._getTooltipText().subtext.replace('km','')));
			drawPolyLine.removeHooks();
			delete drawPolyLine;
		}
	});

	$('body').on("click", '[data-role="del-route"]', function (e) {
		e.preventDefault();
		var routeID = $(this).attr('data-route-id');
		m_route.remove(routeID);
		return false;
	});
	$('body').on("click", '[data-role="edit-route"]', function (e) {
		e.preventDefault();
		var routeID = $(this).attr('data-route-id');
		var route = m_route.get(routeID);
		route.polyline().editing.enable();
		m_route.edit_mode(true);
		m_route.selected_routeID(routeID);
		/*var zone = m_zone.get(zoneID);
		zone.marker.openPopup();*/
		return false;
	});

	window.routeVM = m_route;
})(this);