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