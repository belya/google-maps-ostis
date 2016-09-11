/* --- src/openstreetmap.js --- */
var OpenStreetMap = OpenStreetMap || { version: "0.1.0" };

/* --- src/openstreetmap-component.js --- */
OpenStreetMapComponent = {
  ext_lang: 'openstreetmap_view',
  formats: ['format_openstreetmap'],
  struct_support: true,
  factory: function(sandbox) {
    return new OpenStreetMapViewer(sandbox);
  }
};

var OpenStreetMapViewer = function(sandbox) {
  this.sandbox = sandbox;
  this.container = '#' + sandbox.container;
  this.sandbox.eventStructUpdate = $.proxy(this.eventStructUpdate, this);
  this.sandbox.updateContent();
};

OpenStreetMapViewer.prototype.eventStructUpdate = function(added, element, arc) {
  console.log(added);
}

SCWeb.core.ComponentManager.appendComponentInitialize(OpenStreetMapComponent);


