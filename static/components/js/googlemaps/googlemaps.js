/* --- src/googlemaps.js --- */
var GoogleMaps = GoogleMaps || { version: "0.1.0" };

/* --- src/namespaces.js --- */
GoogleMaps.Map = {};
GoogleMaps.Modal = {};

/* --- src/keynodes.js --- */
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

/* --- src/model.js --- */
GoogleMaps.Model = function() {
  this.initSubscribers();
  this.initObjects();
  this.initObjectFactory();
};

GoogleMaps.Model.prototype.initSubscribers = function() {
  this.subscribers = [];
};

GoogleMaps.Model.prototype.initObjects = function() {
  this.objects = {};
};

GoogleMaps.Model.prototype.initObjectFactory = function() {
  this.factory = new GoogleMaps.ObjectFactory();
};

GoogleMaps.Model.prototype.setCurrent = function(current) {
  this.current = current;
  this.notify();
};

GoogleMaps.Model.prototype.add = function(node, contour) {
  var self = this;
  this.factory.setContour(contour);
  this.factory.create(node)
    .promise()
    .done(function(object) {
      self.objects[node] = object;
      self.notify();
    });
};

GoogleMaps.Model.prototype.remove = function(node) {
  delete this.objects[node];
  this.notify();
};

GoogleMaps.Model.prototype.subscribe = function(subscriber) {
  this.subscribers.push(subscriber);
};

GoogleMaps.Model.prototype.notify = function() {
  for(var i = 0; i < this.subscribers.length; i++)
    this.subscribers[i].update(this);
};

GoogleMaps.Model.prototype.update = function(node) {
  
};

/* --- src/object-factory.js --- */
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

/* --- src/agent.js --- */
GoogleMaps.Agent = function(question, args) {
  this.setQuestion(question);
  this.setArguments(args);
};

GoogleMaps.Agent.prototype.setQuestion = function(question) {
  this.question = question;
};

GoogleMaps.Agent.prototype.setArguments = function(args) {
  this.args = args;
};

GoogleMaps.Agent.prototype.run = function() {
  var self = this;
  var deferred = $.Deferred();
  this.createAgentNode().promise()
    .done(function(node) {
      self.agentNode = node;
      self.createAgentNodeSurrounding()
        .done(function() {
          self.startAgent().promise()
            .done(function() {
              self.waitForAnswer()
                .done(deferred.resolve)
            });
        });
    });
  return deferred;
};

GoogleMaps.Agent.prototype.createAgentNode = function() {
  return window.sctpClient.create_node(sc_type_const | sc_type_node);
};

GoogleMaps.Agent.prototype.createAgentNodeSurrounding = function() {
  var self = this;
  var deferred = $.Deferred();
  this.addToQuestionSet()
    .done(function() {
      self.addToSpecifiedQuestionSet()
        .done(function() {
          self.createArgs()
            .done(deferred.resolve);
        });
    })
  return deferred;
};

GoogleMaps.Agent.prototype.addToQuestionSet = function() {
  return window.sctpClient.create_arc(
    sc_type_arc_pos_const_perm, 
    GoogleMaps.keynodes.get('question'), 
    this.agentNode
  );
};

GoogleMaps.Agent.prototype.addToSpecifiedQuestionSet = function() {
  return window.sctpClient.create_arc(
    sc_type_arc_pos_const_perm, 
    GoogleMaps.keynodes.get(this.question), 
    this.agentNode
  );
};

GoogleMaps.Agent.prototype.createArgs = function() {
  var self = this;
  var deferreds = [];
  for(var i = 0; i < this.args.length; i++)
    deferreds.push($.Deferred());
  $(this.args).each(function(index, argument) {
    var rrel = GoogleMaps.keynodes.get("rrel_" + (index + 1));
    window.sctpClient.create_arc(
      sc_type_arc_pos_const_perm, 
      self.agentNode, 
      argument
    ).done(function(arc) {
      window.sctpClient.create_arc(
        sc_type_arc_pos_const_perm, 
        rrel, 
        arc
      )
        .done(deferreds[index].resolve)
        .fail(function() {
          console.log(arguments);
        })
    });
  });
  return $.when.apply($, deferreds);
};

GoogleMaps.Agent.prototype.startAgent = function() {
  return window.sctpClient.create_arc(
    sc_type_arc_pos_const_perm, 
    GoogleMaps.keynodes.get('question_initiated'), 
    this.agentNode
  );
};

GoogleMaps.Agent.prototype.waitForAnswer = function() {
  var deferred = $.Deferred();
  var process = setTimeout(function() {
    // window.sctpClient.iterate_elements(SctpIteratorType.SCTP_ITERATOR_3F_A_F, [
    //   GoogleMaps.keynodes.get('question_finished'),
    //   sc_type_arc_pos_const_perm,
    //   this.agentNode
    // ])
    //   .done(function() {
    //     clearTimeout(process);
    //     deferred.resolve();
    //   })
    deferred.resolve();
  }, 5000);
  return deferred;
};

/* --- src/bundle.js --- */
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

/* --- src/map/view.js --- */
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

/* --- src/map/controller.js --- */
GoogleMaps.Map.Controller = function(model) {
  this.setModel(model);
}

GoogleMaps.Map.Controller.prototype.setModel = function(model) {
  this.model = model;
};

GoogleMaps.Map.Controller.prototype.setCurrent = function(current) {
  this.model.setCurrent(current);
};

/* --- src/map/subscriber.js --- */
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

/* --- src/modal/view.js --- */
GoogleMaps.Modal.View = function(container) {
  this.setContainer(container);
  this.initModal();
  this.initComponents();
  this.initButtonsListeners();
};

GoogleMaps.Modal.View.prototype.setContainer = function(container) {
  var newContainer = $("<div class='modal fade' role='dialog'></div>");
  $(container).append(newContainer);
  this.container = newContainer;
};

GoogleMaps.Modal.View.prototype.initModal = function() {
  this.container.html(GoogleMaps.Modal.MODAL_HTML);
};

GoogleMaps.Modal.View.prototype.initComponents = function() {
  this.title = this.container.find(".modal-title");
  this.description = this.container.find(".modal-body p");
  this.image = this.container.find(".modal-body img");
  this.goToButton = this.container.find(".btn-primary");
  // this.applyButton = this.container.find(".btn-success");
  this.attachButton = this.container.find(".attachment");
};

GoogleMaps.Modal.View.prototype.initButtonsListeners = function() {
  var self = this;
  // this.applyButton.click(function() {
  //   self.controller.getObjectStateIn(2016);
  // });
  this.goToButton.click(function() {
    self.controller.goTo();
  });
  this.attachButton.click(function() {
    self.controller.attach();
  });
};

GoogleMaps.Modal.View.prototype.control = function(controller) {
  this.controller = controller;
};

GoogleMaps.Modal.View.prototype.setTitle = function(title) {
  this.title.text(title);
};

GoogleMaps.Modal.View.prototype.setDescription = function(description) {
  if (description) {
    this.description.show();
    this.description.text(description);
  }
  else
    this.description.hide();
};

GoogleMaps.Modal.View.prototype.setImage = function(image) {
  if (image) {
    this.image.attr("src", "api/link/content/?addr=" + image);
    this.image.show();
  }
  else
    this.image.hide();
};

GoogleMaps.Modal.View.prototype.show = function() {
  this.container.modal();
};

GoogleMaps.Modal.MODAL_HTML = 
'<div class="modal-dialog">' +
'  <div class="modal-content">' +
'    <div class="modal-header">' +
'      <button type="button" class="close" data-dismiss="modal">&times;</button>' +
'      <h4 class="modal-title"></h4>' +
'    </div>' +
'    <div class="modal-body">' +
'      <p></p>' +
'      <img class="img-thumbnail" style="width: 60%;"></img>' +
'    </div>' +
'    <div class="modal-footer">' +
// '      <div class="col-sm-3">' +
// '        <input type="number" min=0 max=2016 class="col-sm-4 form-control" placeholder="2016"/>' +
// '      </div>' +
'      <button type="button" class="btn attachment btn-default" data-dismiss="modal"><i class="glyphicon glyphicon-pushpin"></i></button>' +
// '      <div class="col-sm-3">' +
// '        <button type="button" class="btn btn-success" data-dismiss="modal">Перейти к дате</button>' +
// '      </div>' +
'      <button type="button" class="btn btn-primary" data-dismiss="modal">Перейти к материалу</button>' +
'      <button type="button" class="btn btn-default" data-dismiss="modal">Отмена</button>' +
'    </div>' +
'  </div>' +
'</div>';

/* --- src/modal/controller.js --- */
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

/* --- src/modal/subscriber.js --- */
GoogleMaps.Modal.Subscriber = function(modal) {
  this.setModal(modal);
}

GoogleMaps.Modal.Subscriber.prototype.setModal = function(modal) {
  this.modal = modal;
};

GoogleMaps.Modal.Subscriber.prototype.update = function(model) {
  if (model.current) {
    var currentObject = model.objects[model.current];
    this.modal.setTitle(currentObject.title);
    this.modal.setDescription(currentObject.description);
    this.modal.setImage(currentObject.image);
    this.modal.show();
  }
};

/* --- src/viewer.js --- */
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

/* --- src/component.js --- */
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

