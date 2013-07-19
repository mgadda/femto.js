(function (exports, XMLHttpRequest, undefined) {
  "use strict";
  
  var StaticMethods; 
  var InstanceMethods;
  var findElements;
  var femtoFun;
  var f;
  var prop;
  
  StaticMethods = {
    ajax: function (method, url, data, success, failure, upload) {
      var prop,
          request = new XMLHttpRequest();
      request.onreadystatechange = function () {                
        var status;
        if (request.readyState === 4) {
            status = 500;
            try {
              status = request.status;
            } catch(e) {}

            if (status === 200) {
              if (typeof success !== "undefined") {
                if (request.response.length > 0) {
                  success(request, JSON.parse(request.response));
                }
                else {
                  success(request, null);
                }
              }
            }
            else {
              if (failure !== undefined) {
                failure();
              }
            }
          }
      };
      
      if (typeof upload !== "undefined") {
        request.upload = upload;
      }

      request.open(method, url, true);
      request.setRequestHeader('Cache-control', 'no-cache');
      if (method === 'POST') {
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      }
      if (typeof data !== "undefined") {
        data = [];
        for (prop in data) {
          if (data.hasOwnProperty(prop)) {
            data.push(prop + "=" + encodeURIComponent(data[prop]));
          }
        }
        request.send(data.join("&"));
      }
      else {
        request.send();
      }
    },

    post: function (url, data, success, failure, upload) {
      this.ajax('POST', url, data, success, failure, upload);
    },
    get: function (url, data, success, failure, upload) {
      this.ajax('GET', url, data, success, failure, upload);
    }
  };

  InstanceMethods = [];
  InstanceMethods.find = function (selector) {
    return f(selector, this);
  };
  InstanceMethods.html = function () {
    return this.map(function (el) { return el.innerHTML; });
  };
  InstanceMethods.first = function () { return this.length > 0 ? this.shift() : null; };
  InstanceMethods.last = function () { return this.length > 0 ? this.pop() : null; };
  InstanceMethods.on = function (eventName, handler) {
    var i,
        outerHandler = function (evt) {
          handler.apply(evt.target, arguments);
        };
        
    for(i=0; i < this.length; i += 1) {
      this[i].addEventListener(eventName, outerHandler);
    }
    return this;
  };
  InstanceMethods.delegate = function (selector, eventName, handler) {
    var i,
        outerHandler = function(evt) {
          if (evt.target.tagName === selector.toUpperCase()) {
            handler.apply(evt.target, arguments);
          }
        };
        
    for(i=0; i < this.length; i += 1) {
      this[i].addEventListener(eventName, outerHandler);
    }
    return this;
  };


  findElements = function (selector, scope) {
    var elements = [], matches, matching;
    
    if (typeof scope === "undefined") {
      scope = [exports.document];
    }
    if (matches = selector.match(/^#([A-Za-z][\-A-Za-z0-9_:.]*)/)) {
      scope.forEach(function (scopingElement) {
        elements = elements.concat(scopingElement.getElementById(matches[1]));
      });
    }
    else if (matches = selector.match(/^\.([A-Za-z][\-A-Za-z0-9_:.]*)/)) {
      scope.forEach(function (scopingElement) {
        var matching = Array.prototype.slice.call(scopingElement.getElementsByClassName(matches[1]));
        elements = elements.concat(matching);
      });

    }
    else {
      scope.forEach(function (scopingElement) {
        matching = Array.prototype.slice.call(scopingElement.getElementsByTagName(selector));
        elements = elements.concat(matching);
      });
    }
    return elements;
  };

  femtoFun = function (selector, scope) {
    var elements = [], that, i;
    
    if (typeof selector !== "undefined") {
      if (typeof selector === "string") {
        elements = findElements(selector, scope);
      }
      else if (typeof selector === "object") {
        elements = [selector];
      }
    }

    that = Object.create(InstanceMethods);

    // Copy matched elements into "that"
    that.length = elements.length;
    for(i=0; i<elements.length; i += 1) {
      that[i] = elements[i];
    }

    return that;
  };

  // Copy static methods onto femtoFun
  for (prop in StaticMethods) {
    if (StaticMethods.hasOwnProperty(prop)) {
      femtoFun[prop] = StaticMethods[prop];
    }
  }

  exports.femto = exports.f = f = femtoFun;

}(window, XMLHttpRequest, undefined));
