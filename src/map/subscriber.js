GoogleMaps.Map.Subscriber = function(map) {
  this.setMap(map);
}

GoogleMaps.Map.Subscriber.prototype.setMap = function(map) {
  this.map = map;
};

GoogleMaps.Map.Subscriber.prototype.update = function(model) {
  this.clearView();
  this.addMarkers(model);
};

GoogleMaps.Map.Subscriber.prototype.clearView = function() {
  this.map.clear();
};

GoogleMaps.Map.Subscriber.prototype.addMarkers = function(model) {
  for(var node in model.objects) {
    var object = model.objects[node];
    this.map.addMarker({
      position: object.position,
      title: object.title,
      node: node,
    });
  }
};