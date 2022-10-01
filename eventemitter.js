var EventEmitter = function() {
  this.listeners = {};
};

EventEmitter.prototype.listeners = null;
EventEmitter.prototype.addEventListener = function(type, callback) {
  if (!(type in this.listeners)) {
    this.listeners[type] = [];
  }
  this.listeners[type].push(callback);
};
EventEmitter.prototype.on = EventEmitter.prototype.addEventListener;

EventEmitter.prototype.removeEventListener = function(type, callback) {
  if (!(type in this.listeners)) {
    return;
  }
  var stack = this.listeners[type];
  for (var i = 0, l = stack.length; i < l; i++) {
    if (stack[i] === callback){
      stack.splice(i, 1);
      return;
    }
  }
};

EventEmitter.prototype.dispatchEvent = function(event, target) {
  if(typeof(event) == "string") {
    event = {
      type: event,
      defaultPrevented: false,
      target: this
    };
  }
  if(target) {
    Object.assign(event, target);
  }
  if (!(event.type in this.listeners)) {
    return true;
  }
  var stack = this.listeners[event.type];

  for (var i = 0, l = stack.length; i < l; i++) {
    var fn = stack[i];
    if(fn.call) {
      fn.call(this, event);
    } else {
      fn(event);
    }
  }
  return !event.defaultPrevented;
};
EventEmitter.prototype.emit = EventEmitter.prototype.dispatchEvent;