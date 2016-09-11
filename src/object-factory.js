GoogleMaps.ObjectFactory = function() {
  
}

GoogleMaps.ObjectFactory.prototype.setContour = function(contour) {
  this.contour = contour;
};

GoogleMaps.ObjectFactory.prototype.create = function(node) {
  var deferred = $.Deferred();
  var self = this;
  this.check(node).promise()
    .done(function() {
      self.createObject(node).promise()
        .done(function(marker) {
          deferred.resolve(marker);
        })
        .fail(deferred.reject);
    })
    .fail(deferred.reject)
  return deferred;
};

GoogleMaps.ObjectFactory.prototype.check = function(node) {
  var deferred = $.Deferred();
  window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_F, [
    //TODO use concept_terrain_object instead
    GoogleMaps.keynodes.get('concept_building'),
    sc_type_arc_pos_const_perm,
    node
  ])
    .done(function(array) {
      if (array.length > 0)
        deferred.resolve();
      else
        deferred.reject();
    })
    .fail(deferred.reject);
  return deferred;
};

GoogleMaps.ObjectFactory.prototype.createObject = function(node) {
  var deferred = $.Deferred();
  var positionDeferred = this.getPosition(node);
  var titleDeferred = this.getTitle(node);
  var imageDeferred = this.getImage(node);
  var descriptionDeferred = this.getDescription(node);
  $.when(positionDeferred, titleDeferred, imageDeferred, descriptionDeferred)
    .done(function(position, title, image, description) {
      var object = {
        position: position,
        title: title,
        image: image,
        description: description
      };
      deferred.resolve(object);
    })
    .fail(function() {
      deferred.reject();
    });
  return deferred;
};

GoogleMaps.ObjectFactory.prototype.getPosition = function(node) {
  var deferred = $.Deferred();
  window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
    node,
    sc_type_arc_common | sc_type_const,
    sc_type_node | sc_type_const,
    sc_type_arc_pos_const_perm,
    GoogleMaps.keynodes.get('nrel_geographical_location')
  ])
    .done(function(array) {
      window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
        array[0][2],
        sc_type_arc_common | sc_type_const,
        sc_type_link,
        sc_type_arc_pos_const_perm,
        GoogleMaps.keynodes.get('nrel_WGS_84_translation')
      ])
        .done(function(array) {
          window.sctpClient.get_link_content(array[0][2],'string')
            .done(function(content) { 
              var parsedContent = content.split(", ");
              var position = {
                lat: parseFloat(parsedContent[0]),
                lng: parseFloat(parsedContent[1]),
              }
              deferred.resolve(position);
            })
        })
    })
  return deferred;
};

GoogleMaps.ObjectFactory.prototype.getTitle = function(node) {
  var deferred = $.Deferred();
  window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
    node,
    sc_type_arc_common | sc_type_const,
    sc_type_link,
    sc_type_arc_pos_const_perm,
    GoogleMaps.keynodes.get('nrel_main_idtf')
  ])
    .done(function(array) {
      var deferreds = [];
      for(var i = 0; i < array.length; i++)
        deferreds.push($.Deferred());
      var identifier;
      $(array).each(function(index, element) {
        var node = element[2];
        window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_F, [
          GoogleMaps.keynodes.get('lang_ru'),
          sc_type_arc_pos_const_perm,
          node
        ])
          .done(function(array) {
            identifier = node;
            deferreds[index].resolve();
          })
          .fail(deferreds[index].resolve)
      }).promise()
        .done(function() {
          $.when.apply($, deferreds).done(function() {
            if (identifier)
              window.sctpClient.get_link_content(identifier, 'string')
                .done(function(content) { 
                  deferred.resolve(content);
                })
            else
              deferred.resolve();
          });
        });
    })
    .fail(deferred.resolve);
  return deferred;
};

GoogleMaps.ObjectFactory.prototype.getKeyElement = function(node, keyElementSet) {
  var self = this;
  var deferred = $.Deferred();
  window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5A_A_F_A_F, [
    sc_type_node | sc_type_const,
    sc_type_arc_pos_const_perm,
    node,
    sc_type_arc_pos_const_perm,
    GoogleMaps.keynodes.get('rrel_key_sc_element')
  ])
    .done(function(array) {
      var deferreds = [];
      for(var i = 0; i < array.length; i++)
        deferreds.push($.Deferred());
      var target;
      $(array).each(function(index, element) {
        var node = element[0];
        window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_F, [
          GoogleMaps.keynodes.get(keyElementSet),
          sc_type_arc_pos_const_perm,
          node
        ])
          .done(function() {
            target = node;
          })
          .always(deferreds[index].resolve)
      }).promise()
        .done(function() {
          $.when.apply($, deferreds).done(function() {
            if (target)
              self.getTranslations(target).promise()
                .done(function(content) { 
                  deferred.resolve(content);
                })
            else
              deferred.resolve();
          });
        });
    })
    .fail(deferred.resolve);
  return deferred;
};

GoogleMaps.ObjectFactory.prototype.getTranslations = function(node) {
  var deferred = $.Deferred();
  window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5A_A_F_A_F, [
    sc_type_node | sc_type_const,
    sc_type_arc_common | sc_type_const,
    node,
    sc_type_arc_pos_const_perm,
    GoogleMaps.keynodes.get('nrel_sc_text_translation')
  ])
    .done(function(array) {
      window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_5F_A_A_A_F, [
        array[0][0],
        sc_type_arc_pos_const_perm,
        sc_type_link,
        sc_type_arc_pos_const_perm,
        GoogleMaps.keynodes.get('rrel_example')
      ])
        .done(function(array) {
          var result = [];
          for(var i = 0; i < array.length; i++)
            result.push(array[i][2]);
          deferred.resolve(result);
        }); 
    });
  return deferred;
};

GoogleMaps.ObjectFactory.prototype.getDescription = function(node) {
  var deferred = $.Deferred();
  this.getKeyElement(node, 'sc_definition').promise()
    .done(function(descriptions) {
      if (descriptions) 
        window.sctpClient.get_link_content(descriptions[0], 'string')
          .done(function(content) {
            deferred.resolve(content);
          })
          .fail(deferred.resolve);
      else
        deferred.resolve();
    })
    .fail(deferred.resolve);
  return deferred;
};

GoogleMaps.ObjectFactory.prototype.getImage = function(node) {
  var deferred = $.Deferred();
  this.getKeyElement(node, 'sc_illustration').promise()
    .done(function(images) {
      if (images)
        deferred.resolve(images[0]);
      else 
        deferred.resolve();
    })
    .fail(deferred.resolve)
  return deferred;
};