GoogleMaps.Bundle = function(options) {
  this.setNamespace(options.namespace);
  this.setModel(options.model);
  this.setContainer(options.container);
  this.initView();
  this.initController();
}

GoogleMaps.Bundle.prototype.setNamespace = function(namespace) {
  this.namespace = namespace;
};

GoogleMaps.Bundle.prototype.setModel = function(model) {
  this.model = model;
};

GoogleMaps.Bundle.prototype.setContainer = function(container) {
  this.container = container;
};

GoogleMaps.Bundle.prototype.initView = function() {
  this.view = new this.namespace.View(this.container);
  var subscriber = new this.namespace.Subscriber(this.view);
  this.model.subscribe(subscriber);
};

GoogleMaps.Bundle.prototype.initController = function() {
  this.controller = new this.namespace.Controller(this.model);
  this.view.control(this.controller);
};