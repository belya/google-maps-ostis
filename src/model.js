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