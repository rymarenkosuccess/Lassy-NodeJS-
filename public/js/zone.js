(function(window) {
	var $ = window.$,
		L = window.L,
		_ = window._;

	var map = window.map;
	
	
	var ZoneIcon = L.Icon.extend({
	    options: {
	        shadowUrl: '../../img/marker-shadow.png',
	        popupAnchor:  [0, -40],
	        iconAnchor: [12, 41]
	    }
	});

	var greenIcon = new ZoneIcon({iconUrl: '../../img/marker-icon-green.png'}),
    	blueIcon = new ZoneIcon({iconUrl: '../../img/marker-icon.png'}),
    	orangeIcon = new ZoneIcon({iconUrl: '../../img/marker-icon-orange.png'});

	var _DEFAULT_ZONE_NAME = '[New Zone]',
		_DEFAULT_ZONE_RADIUS = 500,
		_DEFAULT_ZONE_FRM_TEMPLATE = _.template('<div class="zone-block"><label>Zone Name</label><input type="text" class="zone_name" value="<%= name() %>" data-zone-id="<%= id %>"/></div><div class="zone-block"><label>Radius</label><input type="text" class="zone_radius" value="<%= radius() %>" data-zone-id="<%= id %>"/></div><a href="#<%= id %>" class="btn btn-success update-zone" data-role="update-zone-name">Save</a>');
		
	function ZoneModel(rawZone) {
		rawZone = rawZone || {};

		this.id = rawZone.id || rawZone._id;
		this.name = ko.observable(rawZone.name || _DEFAULT_ZONE_NAME );
		this.latlng = ko.observable(rawZone.hasOwnProperty('position')?rawZone.position.coordinates||rawZone.position:null);
		if (rawZone.hasOwnProperty('lat') && rawZone.hasOwnProperty('lng'))
			this.latlng([rawZone.lng, rawZone.lat]);
		this.radius = ko.observable(rawZone.radius || _DEFAULT_ZONE_RADIUS);
		this.marker = null;
		this.status = ko.observable('normal');
		this.isNew = rawZone.isNew || true;
	}
	ZoneModel.prototype.exertme = function () {
		return {
			_id: this.id,
			latlng: this.latlng(),
			name: this.name(),
			radius: this.radius()
		};
	}

	function Zone(L, map) {
		this.L = L;
		this.map = map;
		this.zones = ko.observableArray([]);
		this.selected = ko.observable(-1);
		this.add_mode = ko.observable(false);
	}

	Zone.prototype.add = function (data) {
		var latlng = {},self = this;
		if(data.hasOwnProperty('position') && Object.prototype.toString.call(data.position.coordinates) === '[object Array]')
		{
			latlng.lng = data.position.coordinates[0];
			latlng.lat = data.position.coordinates[1];
		}else if(data.hasOwnProperty('latlng')){
			latlng = data.latlng;
		}

		var renderZone = function(d)
		{
			var zone = new ZoneModel(d);
			var zlatlng = zone.latlng();
			zone['marker'] = this.L.marker(new L.LatLng(zlatlng[1], zlatlng[0]), {icon: blueIcon})
							  .addTo(this.map)
							  .bindPopup(_DEFAULT_ZONE_FRM_TEMPLATE(zone))
			self.zones.push(zone);
			zone.marker._zone = zone;
			zone.marker.openPopup();
				
			return zone;
		}
		if(data.isNew)
		{
			var modelData = {
				'lassy_id': window.lid,
				zonename: '[NewZone]',
				lat:latlng.lat,
				lng:latlng.lng
			};

			api('create', 'zones', 
				modelData,
				function(resp){
				if(resp.error) 
				{
					alert('Error creating zone')
				}else{
					modelData.id = resp.id;
					return renderZone(modelData)
				}
			});
		}else{
			return renderZone(data);
		}
	}
	Zone.prototype.get = function (zoneID) {
		var zones = this.zones();
		return _.find(zones, function (zone) {
			return zone.id == zoneID;
		});
	}
	Zone.prototype.getall = function () {
		return this.zones();
	}
	Zone.prototype.loadZones = function () {
		var self = this;
		self.zones.removeAll();
		api('list', 'zones', {}, function (data) {
			if (data.error) {
				alert('zone Loading error');
				return ;
			}
			for (var idx = 0; idx < data.length; idx++) {
				var rawZone = data[idx];
				rawZone.isNew = false;
				self.add(rawZone).marker.closePopup();
			}
		});
	}
	Zone.prototype.remove = function (zoneID) {
		var self = this;
		this.zones.remove(function(zone) {
			if (zone.id == zoneID){

				//call api

				zone.marker.closePopup();
				self.map.removeLayer(zone.marker);
				return true;
			} else {
				return false;
			}
		});
	}
	Zone.prototype.expertall = function () {
		var zones = this._zones(),
			json = [];
		for (var idx=0,len=zones.length;idx<len;idx++) {
			json.push(zones[idx].expertme());
		}
		return json;
	}
	Zone.prototype.bindeditform = function () {
		var self = this;
		var zones = this.zones();
		$('body').on("keyup", ".zone-block .zone_name, .zone-block .zone_radius", function (event) {
			var zoneID = $(event.currentTarget).attr('data-zone-id');
			var changed = $(event.currentTarget).val();

			var zone = self.get(zoneID);
			if (!zone)
				return;
			if ($(event.currentTarget).is('.zone_name'))
				zone.name(changed);
			else
				zone.radius(changed);
		});		
	}
	Zone.prototype.setMarkerStatus = function (zone, status) {
		var icon;
		if (status == 'in')
			icon = greenIcon;
		else if (status == 'out')
			icon = blueIcon;
		else if (status == 'selected')
			icon = orangeIcon;
		else
			icon = blueIcon;

		zone.marker.setIcon(icon);
		zone.status(status);

		return true;
	}

	var m_zone = new Zone(L, map);
	m_zone.bindeditform();

	var is_waitingMapClick = false;

	map.on('popupopen', function (eventData) {
		var popup = eventData.popup;	
		var zone = m_zone.get(popup._source._zone.id);
		if (zone) {
			$('.leaflet-popup-content').html(_DEFAULT_ZONE_FRM_TEMPLATE(zone));
			//handle click event
			$('.leaflet-popup-content .update-zone').click(function(e){
				e.preventDefault();
				//update name/radius
				var pl = {
					name: $(this).parent().find('.zone_name').val(),
					radius: $(this).parent().find('.zone_radius').val(),
					id:$(this).attr('href').substring(1)
				};
				api('change', 'zones', {id:pl.id, data:pl}, function(resp){
					if(!resp.success)
					{
						alert('could not update name with server');
					}
				})			
				
			})
			m_zone.setMarkerStatus(zone, 'selected');

		}

		$('.zone-block .zone_name').focus();
		return true;
	}).on('popupclose', function (eventData) {
		var popup = eventData.popup;
		var zoneID = popup._content.match(/data-zone-id="(\w+)"/)[1];
		$('.leaflet-popup-content .update-zone').unbind('click');
		var zone = m_zone.get(zoneID);
		if (zone)
			m_zone.setMarkerStatus(zone, 'out');
		return true;
	});

	$('[data-role="add-zone"]').click(function () {
		$('.lassyzones-guide').show();
		$('#zone-list').hide();
		m_zone.add_mode(true);
	});
	$('body').on("click", '[data-role="edit-zone"]', function (e) {
		var zoneID = $(this).attr('data-zone-id');
		var zone = m_zone.get(zoneID);
		map.panTo(new L.LatLng(zone.marker._latlng.lat, zone.marker._latlng.lng))
		zone.marker.openPopup();
	});
	$('body').on("click", '[data-role="del-zone"]', function (e) {
		var zoneID = $(this).attr('data-zone-id');
		var zone = m_zone.remove(zoneID);
		api('destroy', 'zones', {id:zoneID}, function(resp){
			if(!resp.success) alert('error while deleting zone');
		})
	});
	$('body').on("focus", '.zone-block .zone_name', function (e) {		
		$(this).select();
	});

	$('.btn-toroute').click(function(e){
		var zs = m_zone.zones();
		console.log(zs.length);
		if(!(zs.length >= 2)) {
			e.preventDefault();
			alert('You must have at least 2 lassyzones');
		}

		
	})
	

	map.on('click', function(e) {		
		if (!m_zone.add_mode())
			return ;
		$('.lassyzones-guide').hide();
		$('#zone-list').show();
		var newzone = m_zone.add({latlng: e.latlng, isNew:true});
		m_zone.add_mode(false);
		/*console.log(e.latlng);
		console.log('here');*/
	});

	window.zoneVM = m_zone;
})(this);