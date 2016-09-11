GoogleMaps.Modal.Controller = function(model) {
  this.setModel(model);
}

GoogleMaps.Modal.Controller.prototype.setModel = function(model) {
  this.model = model;
};

GoogleMaps.Modal.Controller.prototype.getObjectStateIn = function(year) {
  if (this.model.current) {
    console.log("getting current state");
    //TODO get time point node
    //TODO run get state agent
  }
};

GoogleMaps.Modal.Controller.prototype.goTo = function() {
  if (this.model.current) {
    SCWeb.core.Main.doDefaultCommand([this.model.current]);
  }
};

GoogleMaps.Modal.Controller.prototype.attach = function() {
  if (this.model.current)
    SCWeb.core.Arguments.appendArgument(this.model.current);
};