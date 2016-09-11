GoogleMaps.Map.Controller = function(model) {
  this.setModel(model);
}

GoogleMaps.Map.Controller.prototype.setModel = function(model) {
  this.model = model;
};

GoogleMaps.Map.Controller.prototype.setCurrent = function(current) {
  this.model.setCurrent(current);
};