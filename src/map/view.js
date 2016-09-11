GoogleMaps.Map.View = function(container) {
  this.setContainer(container);
  this.initMap();
  this.initMarkers();
};

GoogleMaps.Map.View.prototype.setContainer = function(container) {
  this.container = container;
};

GoogleMaps.Map.View.prototype.initMap = function() {
  this.map = new google.maps.Map(
    this.container, {
      center: {
        lat: -34.397, 
        lng: 150.644
      },
      zoom: 13
    });
};

GoogleMaps.Map.View.prototype.initMarkers = function() {
  this.markers = [];
};

GoogleMaps.Map.View.prototype.control = function(controller) {
  this.controller = controller;
};

GoogleMaps.Map.View.prototype.clear = function() {
  for(var i = 0; i < this.markers.length; i++)
    this.markers[i].setMap(null);
  this.markers = [];
};

GoogleMaps.Map.View.prototype.addMarker = function(markerArguments) {
  var self = this;
  var marker = new google.maps.Marker(markerArguments);
  this.markers.push(marker);
  marker.setMap(this.map);
  marker.addListener('click', function() {
    self.controller.setCurrent(marker.node);
  });
  this.map.setCenter(markerArguments.position);
};