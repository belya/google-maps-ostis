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