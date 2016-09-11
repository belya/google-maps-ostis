GoogleMaps.Viewer = function(sandbox, deferred) {
  this.sandbox = sandbox;
  var self = this;
  this.container = document.getElementById(sandbox.container);
  this.initModel();
  this.initMap();
  this.initModal();
  this.initEventCallbacks();
  deferred.promise().done(function() {
    self.sandbox.updateContent();
  })
};

GoogleMaps.Viewer.prototype.initKeynodes = function() {
  this.keynodes = new GoogleMaps.Keynodes();
};

GoogleMaps.Viewer.prototype.initMap = function() {
  this.map = new GoogleMaps.Bundle({
    namespace: GoogleMaps.Map,
    model: this.model,
    container: this.container,
  });
}

GoogleMaps.Viewer.prototype.initModal = function() {
  this.modal = new GoogleMaps.Bundle({
    namespace: GoogleMaps.Modal,
    model: this.model,
    container: this.container,
  });
};

GoogleMaps.Viewer.prototype.initModel = function() {
  this.model = new GoogleMaps.Model();
}

GoogleMaps.Viewer.prototype.initEventCallbacks = function() {
  this.sandbox.eventStructUpdate = $.proxy(this.eventStructUpdate, this);
}

GoogleMaps.Viewer.prototype.eventStructUpdate = function(added, contour, arc) {
  var self = this;
  window.sctpClient.get_arc(arc)
    .done(function(array) {
      if (added)
        self.addNode(array[1], contour);
      else
        self.removeNode(array[1]);
    });
}

GoogleMaps.Viewer.prototype.addNode = function(element, contour) {
  this.model.add(element, contour);
}

GoogleMaps.Viewer.prototype.removeNode = function(element) {
  this.model.remove(element);
}