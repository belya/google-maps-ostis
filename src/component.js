GoogleMaps.Component = {
  ext_lang: 'google_maps_view',
  formats: ['format_google_maps'],
  struct_support: true,
  factory: function(sandbox) {
    GoogleMaps.keynodes = new GoogleMaps.Keynodes();
    return new GoogleMaps.Viewer(sandbox, GoogleMaps.keynodes.init());
  }
};

SCWeb.core.ComponentManager.appendComponentInitialize(GoogleMaps.Component);