GoogleMaps.Keynodes = function() {
  
}

GoogleMaps.Keynodes.IDENTIFIERS = [
  'concept_terrain_object',
  'concept_building',
  'nrel_geographical_location',
  'nrel_WGS_84_translation',
  'concept_coordinate', 
  'nrel_WGS_84_translation',
  'rrel_latitude',
  'rrel_longitude',
  'nrel_value',
  'nrel_main_idtf',
  'lang_ru',
  'rrel_key_sc_element',
  'sc_illustration',
  'sc_definition',
  'nrel_sc_text_translation',
  'rrel_example',
];

GoogleMaps.Keynodes.prototype.init = function() {
  var deferred = $.Deferred();
  var self = this;
  SCWeb.core.Server.resolveScAddr(GoogleMaps.Keynodes.IDENTIFIERS, function (keynodes) {
    self.keynodes = keynodes;
    deferred.resolve();
  });
  return deferred;
};


GoogleMaps.Keynodes.prototype.get = function(identifier) {
  return this.keynodes[identifier];
};
